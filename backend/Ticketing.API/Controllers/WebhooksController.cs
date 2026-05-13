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
    IOptions<StripeSettings> options) : ControllerBase
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

            var userId = Guid.Parse(session.Metadata["userId"]);
            var eventId = Guid.Parse(session.Metadata["eventId"]);
            var items = System.Text.Json.JsonSerializer.Deserialize<OrderItemRequest[]>(session.Metadata["items"])!;

            var request = new CreateOrderRequest(eventId, items);
            await orderService.CreateOrderAsync(userId, request, session.Id);
        }

        return Ok();
    }
}
