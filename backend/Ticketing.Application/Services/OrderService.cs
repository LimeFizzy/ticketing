using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null);
}

public class OrderService(
    IOrderRepository orderRepository,
    ITicketRepository ticketRepository,
    IEventRepository eventRepository) : IOrderService
{
    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null)
    {
        var @event = await eventRepository.GetByIdAsync(request.EventId)
            ?? throw new InvalidOperationException("Event not found");

        var ticketTypeLookup = @event.TicketTypes.ToDictionary(t => t.Id);
        var totalTickets = request.Items.Sum(i => i.Quantity);

        if (@event.AvailableTickets < totalTickets)
            throw new InvalidOperationException("Not enough tickets available");

        decimal total = 0;
        var ticketsToCreate = new List<Ticket>();

        foreach (var item in request.Items)
        {
            if (!ticketTypeLookup.TryGetValue(item.EventTicketTypeId, out var tt))
                throw new InvalidOperationException($"Ticket type {item.EventTicketTypeId} not found");

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
                    Status = "Active"
                });
            }
        }

        var order = new Order
        {
            UserId = userId,
            EventId = request.EventId,
            TotalAmount = total,
            Status = "Confirmed",
            StripeSessionId = stripeSessionId,
            Tickets = ticketsToCreate
        };

        await orderRepository.CreateAsync(order);

        @event.AvailableTickets -= totalTickets;

        await orderRepository.SaveChangesAsync();

        return MapToDto(order, @event);
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
                @event.ImageUrl
            )).ToArray()
        );
    }
}
