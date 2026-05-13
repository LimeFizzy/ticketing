using System.Text.Json;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;

namespace Ticketing.API.Services;

public interface IStripeService
{
    Task<CheckoutSessionDto> CreateCheckoutSessionAsync(
        Guid userId, string userEmail, CreateCheckoutSessionRequest request);
}

public class StripeService(
    IOptions<StripeSettings> options,
    IEventRepository eventRepository) : IStripeService
{
    public async Task<CheckoutSessionDto> CreateCheckoutSessionAsync(
        Guid userId, string userEmail, CreateCheckoutSessionRequest request)
    {
        var @event = await eventRepository.GetByIdAsync(request.EventId)
            ?? throw new InvalidOperationException("Event not found");

        var ticketTypeLookup = @event.TicketTypes.ToDictionary(t => t.Id);

        var lineItems = new List<SessionLineItemOptions>();
        foreach (var item in request.Items)
        {
            if (!ticketTypeLookup.TryGetValue(item.EventTicketTypeId, out var tt))
                throw new InvalidOperationException($"Ticket type {item.EventTicketTypeId} not found");

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "eur",
                    UnitAmount = (long)(tt.Price * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"{@event.Title} — {tt.Name}",
                        Description = tt.Description,
                    }
                },
                Quantity = item.Quantity,
            });
        }

        var metadata = new Dictionary<string, string>
        {
            { "userId", userId.ToString() },
            { "eventId", request.EventId.ToString() },
            { "items", JsonSerializer.Serialize(request.Items.Select(i => new
            { i.EventTicketTypeId, i.Quantity }).ToArray()) }
        };

        var sessionOptions = new SessionCreateOptions
        {
            Mode = "payment",
            LineItems = lineItems,
            SuccessUrl = options.Value.SuccessUrl,
            CancelUrl = options.Value.CancelUrl,
            CustomerEmail = userEmail,
            Metadata = metadata,
        };

        var service = new SessionService();
        var session = await service.CreateAsync(sessionOptions);

        return new CheckoutSessionDto(session.Url);
    }
}
