using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    IPromoCodeRepository promoCodeRepository,
    IOptions<StripeSettings> options,
    ILogger<WebhooksController> logger) : ControllerBase
{
    [HttpPost("stripe")]
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> HandleStripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                options.Value.WebhookSecret);
        }
        catch (StripeException)
        {
            return BadRequest();
        }

        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            if (stripeEvent.Data.Object is not Session session) return Ok();

            if (!string.IsNullOrEmpty(session.Id))
            {
                var existing = await orderRepository.GetByStripeSessionIdAsync(session.Id);
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

                var items = System.Text.Json.JsonSerializer.Deserialize<OrderItemRequest[]>(itemsJson);
                if (items == null || items.Length == 0)
                {
                    logger.LogWarning("Stripe webhook empty items in session {SessionId}", session.Id);
                    return Ok();
                }

                Guid? promoCodeId = session.Metadata.TryGetValue("promoCodeId", out var pcId) && Guid.TryParse(pcId, out var parsed)
                    ? parsed : null;
                decimal discountAmount = session.Metadata.TryGetValue("discountAmount", out var da) && decimal.TryParse(da, out var parsedDa)
                    ? parsedDa : 0;

                var request = new CreateOrderRequest(eventId, items);
                var order = await orderService.CreateOrderAsync(userId, request, session.Id, promoCodeId, discountAmount);

                if (promoCodeId.HasValue)
                    await promoCodeRepository.IncrementUsageAsync(promoCodeId.Value);

                BackgroundJob.Enqueue(() => emailService.SendOrderConfirmationAsync(order.Id));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Stripe webhook failed processing session {SessionId}", session.Id);
            }
        }

        return Ok();
    }
}
