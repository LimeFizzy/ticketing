using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null, Guid? promoCodeId = null, decimal discountAmount = 0, CancellationToken cancellationToken = default);
}

public class OrderService(
    IOrderRepository orderRepository,
    ITicketRepository ticketRepository,
    IEventRepository eventRepository,
    IEventTicketTypeRepository eventTicketTypeRepository,
    IVenueMapRepository venueMapRepository,
    IEventVenueMapPlaceRepository eventVenueMapPlaceRepository,
    IPromoCodeRepository promoCodeRepository,
    IPromoCodeService promoCodeService) : IOrderService
{
    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, string? stripeSessionId = null, Guid? promoCodeId = null, decimal discountAmount = 0, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new InvalidOperationException("Event not found");

        if (@event.Status != EventStatus.Published)
            throw new InvalidOperationException("Event is not available for purchase");

        var ticketTypeLookup = @event.TicketTypes.ToDictionary(t => t.Id);

        foreach (var item in request.Items)
        {
            if (!ticketTypeLookup.TryGetValue(item.EventTicketTypeId, out _))
                throw new InvalidOperationException($"Ticket type {item.EventTicketTypeId} not found");
        }

        if (promoCodeId.HasValue)
        {
            var promoCode = await promoCodeRepository.GetByIdAsync(promoCodeId.Value, cancellationToken)
                ?? throw new InvalidOperationException("Promo code not found");

            if (!promoCode.IsActive)
                throw new InvalidOperationException("Promo code is no longer active");

            if (promoCode.ExpiresAt.HasValue && promoCode.ExpiresAt.Value < DateTime.UtcNow)
                throw new InvalidOperationException("Promo code has expired");

            if (promoCode.MaxUses.HasValue && promoCode.CurrentUses >= promoCode.MaxUses.Value)
                throw new InvalidOperationException("Promo code usage limit reached");

            if (promoCode.EventId != request.EventId)
                throw new InvalidOperationException("Promo code is not valid for this event");

            var totalOriginal = request.Items.Sum(item => ticketTypeLookup[item.EventTicketTypeId].Price * item.Quantity);
            var expectedDiscount = promoCodeService.CalculateDiscount(promoCode, totalOriginal);
            if (Math.Abs(expectedDiscount - discountAmount) > 0.01m)
                throw new InvalidOperationException("Discount amount does not match promo code");
        }

        Order? order = null;

        var totalQuantity = request.Items.Sum(i => i.Quantity);
        var codes = await GenerateUniqueCodesAsync(totalQuantity, cancellationToken);
        var codeIndex = 0;

        await orderRepository.ExecuteInTransactionAsync(async ct =>
        {
            decimal total = 0;
            var ticketsToCreate = new List<Ticket>();

            foreach (var item in request.Items)
            {
                var tt = ticketTypeLookup[item.EventTicketTypeId];

                if (item.VenueMapPlaceId.HasValue)
                {
                    var mapping = await eventVenueMapPlaceRepository
                        .GetByEventAndPlaceAsync(request.EventId, item.VenueMapPlaceId.Value, cancellationToken) ?? throw new InvalidOperationException($"Place {item.VenueMapPlaceId} is not mapped to this event");
                    if (mapping.EventTicketTypeId != item.EventTicketTypeId)
                        throw new InvalidOperationException($"Place {item.VenueMapPlaceId} is not mapped to ticket type {tt.Name}");

                    var (placeSold, placeCapacity) = await venueMapRepository.GetPlaceCapacityWithLockAsync(item.VenueMapPlaceId.Value, cancellationToken);

                    if (item.Quantity > placeCapacity)
                        throw new InvalidOperationException($"Cannot order {item.Quantity} tickets for a place with capacity {placeCapacity}");

                    if (placeSold + item.Quantity > placeCapacity)
                        throw new InvalidOperationException("Not enough capacity for place");
                }
                else
                {
                    var soldCount = await eventTicketTypeRepository.GetSoldCountWithLockAsync(tt.Id, cancellationToken);
                    if (soldCount + item.Quantity > tt.Capacity)
                        throw new InvalidOperationException($"Not enough capacity for ticket type {tt.Name}");
                }

                total += tt.Price * item.Quantity;

                for (var i = 0; i < item.Quantity; i++)
                {
                    ticketsToCreate.Add(new Ticket
                    {
                        TicketCode = codes[codeIndex++],
                        EventTicketTypeId = tt.Id,
                        UserId = userId,
                        PricePaid = tt.Price,
                        Status = TicketStatus.Active,
                        VenueMapPlaceId = item.VenueMapPlaceId
                    });
                }
            }

            var effectiveDiscount = promoCodeId.HasValue ? Math.Clamp(discountAmount, 0, total) : 0;

            order = new Order
            {
                UserId = userId,
                EventId = request.EventId,
                TotalAmount = total - effectiveDiscount,
                Status = OrderStatus.Confirmed,
                StripeSessionId = stripeSessionId,
                PromoCodeId = promoCodeId,
                DiscountAmount = effectiveDiscount,
                Tickets = ticketsToCreate
            };

            await orderRepository.CreateAsync(order, cancellationToken);
            await orderRepository.SaveChangesAsync(cancellationToken);

            if (promoCodeId.HasValue)
                await promoCodeRepository.IncrementUsageAsync(promoCodeId.Value, cancellationToken);
        }, cancellationToken);

        return MapToDto(order!, @event);
    }

    private async Task<List<string>> GenerateUniqueCodesAsync(int count, CancellationToken cancellationToken)
    {
        var codes = new HashSet<string>();
        var attempts = 0;
        var maxAttempts = count * 10;
        while (codes.Count < count && attempts < maxAttempts)
        {
            var code = $"TF-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
            if (!codes.Contains(code) && !await ticketRepository.ExistsByCodeAsync(code, cancellationToken))
                codes.Add(code);
            attempts++;
        }
        if (codes.Count < count)
            throw new InvalidOperationException("Failed to generate unique ticket codes");
        return codes.ToList();
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
                t.VenueMapPlace?.Label,
                null
            )).ToArray(),
            null
        );
    }
}
