using Hangfire;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Application.Services;
using Ticketing.Domain.Constants;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhooksController(
    IOrderService orderService,
    IOrderRepository orderRepository,
    IEmailService emailService,
    IOptions<StripeSettings> options,
    ILogger<WebhooksController> logger) : ControllerBase
{
    private const int MaxWebhookBodySize = 1 * 1024 * 1024;

    [HttpPost("stripe")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    [ApiExplorerSettings(IgnoreApi = true)]
    [EnableRateLimiting("webhook")]
    [RequestSizeLimit(MaxWebhookBodySize)]
    public async Task<IActionResult> HandleStripeWebhook(CancellationToken cancellationToken = default)
    {
        HttpContext.Request.EnableBuffering();
        using var reader = new StreamReader(HttpContext.Request.Body, leaveOpen: true);
        var json = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(options.Value.WebhookSecret))
        {
            logger.LogError("Stripe webhook secret is not configured");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new ProblemDetails { Title = "Webhook processing error" });
        }

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                options.Value.WebhookSecret);
        }
        catch (StripeException ex)
        {
            logger.LogWarning(ex, "Stripe webhook signature validation failed");
            return BadRequest(new ProblemDetails { Title = "Invalid webhook signature" });
        }

        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            if (stripeEvent.Data.Object is not Session session) return Ok();

            if (!string.IsNullOrEmpty(session.Id))
            {
                var existing = await orderRepository.GetByStripeSessionIdAsync(session.Id, cancellationToken);
                if (existing != null) return Ok();
            }

            try
            {
                if (!session.Metadata.TryGetValue("userId", out var userIdStr) ||
                    !Guid.TryParse(userIdStr, out var userId))
                {
                    logger.LogWarning("Stripe webhook missing or invalid userId in session {SessionId}", session.Id);
                    return Ok();
                }

                if (!session.Metadata.TryGetValue("eventId", out var eventIdStr) ||
                    !Guid.TryParse(eventIdStr, out var eventId))
                {
                    logger.LogWarning("Stripe webhook missing or invalid eventId in session {SessionId}", session.Id);
                    return Ok();
                }

                if (!session.Metadata.TryGetValue("items", out var itemsJson) ||
                    string.IsNullOrEmpty(itemsJson))
                {
                    logger.LogWarning("Stripe webhook missing items in session {SessionId}", session.Id);
                    return Ok();
                }

                OrderItemRequest[] items;
                try
                {
                    items = System.Text.Json.JsonSerializer.Deserialize<OrderItemRequest[]>(itemsJson)
                        ?? [];
                }
                catch (System.Text.Json.JsonException ex)
                {
                    logger.LogWarning(ex, "Stripe webhook invalid items JSON in session {SessionId}", session.Id);
                    return Ok();
                }

                if (items.Length == 0)
                {
                    logger.LogWarning("Stripe webhook empty items in session {SessionId}", session.Id);
                    return Ok();
                }

                foreach (var item in items)
                {
                    if (item.EventTicketTypeId == Guid.Empty || item.Quantity < 1 || item.Quantity > 100)
                    {
                        logger.LogWarning("Stripe webhook invalid item in session {SessionId}: TicketTypeId={TypeId}, Quantity={Qty}",
                            session.Id, item.EventTicketTypeId, item.Quantity);
                        return BadRequest(new ProblemDetails { Title = "Invalid item data in session" });
                    }
                }

                Guid? promoCodeId = session.Metadata.TryGetValue("promoCodeId", out var pcId) && Guid.TryParse(pcId, out var parsed)
                    ? parsed : null;
                decimal discountAmount = session.Metadata.TryGetValue("discountAmount", out var da) && decimal.TryParse(da, out var parsedDa)
                    ? parsedDa : 0;

                var request = new CreateOrderRequest(eventId, items);
                var order = await orderService.CreateOrderAsync(userId, request, session.Id, promoCodeId, discountAmount, cancellationToken);

                BackgroundJob.Enqueue(() => emailService.SendOrderConfirmationAsync(order.Id));
            }
            catch (InvalidOperationException ex)
            {
                logger.LogError(ex, "Stripe webhook failed processing session {SessionId}", session.Id);
                return BadRequest(new ProblemDetails { Title = "Order creation failed" });
            }
            catch (DbUpdateException ex)
            {
                logger.LogError(ex, "Stripe webhook database error processing session {SessionId}", session.Id);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        return Ok();
    }
}
