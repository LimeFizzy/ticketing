using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null, Guid? promoCodeId = null, decimal discountAmount = 0);
}

public class OrderService(
    IOrderRepository orderRepository,
    ITicketRepository ticketRepository,
    IEventRepository eventRepository,
    IEventTicketTypeRepository eventTicketTypeRepository,
    IVenueMapRepository venueMapRepository,
    IEventVenueMapPlaceRepository eventVenueMapPlaceRepository) : IOrderService
{
    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null, Guid? promoCodeId = null, decimal discountAmount = 0)
    {
        var @event = await eventRepository.GetByIdAsync(request.EventId)
            ?? throw new InvalidOperationException("Event not found");

        var ticketTypeLookup = @event.TicketTypes.ToDictionary(t => t.Id);
        var totalTickets = request.Items.Sum(i => i.Quantity);

        decimal total = 0;
        var ticketsToCreate = new List<Ticket>();

        foreach (var item in request.Items)
        {
            if (!ticketTypeLookup.TryGetValue(item.EventTicketTypeId, out var tt))
                throw new InvalidOperationException($"Ticket type {item.EventTicketTypeId} not found");

            if (item.VenueMapPlaceId.HasValue)
            {
                var mapping = await eventVenueMapPlaceRepository
                    .GetByEventAndPlaceAsync(request.EventId, item.VenueMapPlaceId.Value);
                if (mapping == null)
                    throw new InvalidOperationException($"Place {item.VenueMapPlaceId} is not mapped to this event");

                if (mapping.EventTicketTypeId != item.EventTicketTypeId)
                    throw new InvalidOperationException($"Place {item.VenueMapPlaceId} is not mapped to ticket type {tt.Name}");

                var placeSold = await venueMapRepository.GetSoldCountForPlaceAsync(item.VenueMapPlaceId.Value);
                if (placeSold + item.Quantity > await GetPlaceCapacityAsync(item.VenueMapPlaceId.Value))
                    throw new InvalidOperationException($"Not enough capacity for place");
            }
            else
            {
                var soldCount = await eventTicketTypeRepository.GetSoldCountAsync(tt.Id);
                if (soldCount + item.Quantity > tt.Capacity)
                    throw new InvalidOperationException($"Not enough capacity for ticket type {tt.Name}");
            }

            total += tt.Price * item.Quantity;

            for (var i = 0; i < item.Quantity; i++)
            {
                var code = await GenerateUniqueCodeAsync();
                ticketsToCreate.Add(new Ticket
                {
                    TicketCode = code,
                    EventTicketTypeId = tt.Id,
                    UserId = userId,
                    PricePaid = tt.Price,
                    Status = "Active",
                    VenueMapPlaceId = item.VenueMapPlaceId
                });
            }
        }

        var order = new Order
        {
            UserId = userId,
            EventId = request.EventId,
            TotalAmount = total - discountAmount,
            Status = "Confirmed",
            StripeSessionId = stripeSessionId,
            PromoCodeId = promoCodeId,
            DiscountAmount = discountAmount,
            Tickets = ticketsToCreate
        };

        await orderRepository.CreateAsync(order);

        await orderRepository.SaveChangesAsync();

        return MapToDto(order, @event);
    }

    private async Task<int> GetPlaceCapacityAsync(Guid placeId)
    {
        var place = await venueMapRepository.GetPlaceByIdAsync(placeId)
            ?? throw new InvalidOperationException($"Place {placeId} not found");
        return place.Capacity;
    }

    private async Task<string> GenerateUniqueCodeAsync()
    {
        string code;
        do
        {
            code = $"TF-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
        } while (await ticketRepository.ExistsByCodeAsync(code));
        return code;
    }

    private static OrderDto MapToDto(Order order, Event @event)
    {
        var ticketTypeNameLookup = @event.TicketTypes.ToDictionary(t => t.Id);

        return new OrderDto(
            order.Id,
            order.EventId,
            order.TotalAmount,
            order.Status,
            order.CreatedAt,
            order.Tickets.Select(t => new TicketDto(
                t.Id,
                t.TicketCode,
                @event.Id,
                t.EventTicketTypeId,
                @event.Title,
                ticketTypeNameLookup.GetValueOrDefault(t.EventTicketTypeId)?.Name ?? "Unknown",
                t.PricePaid,
                t.Status,
                @event.Date,
                @event.Venue,
                @event.City,
                @event.ImageUrl,
                null,
                t.VenueMapPlaceId,
                t.VenueMapPlace?.Label
            )).ToArray()
        );
    }
}
