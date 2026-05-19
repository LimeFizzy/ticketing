using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record CreateCheckoutSessionRequest(
    [Required] Guid EventId,
    [Required] OrderItemRequest[] Items,
    string? PromoCode
);

public record OrderItemRequest(
    [Required] Guid EventTicketTypeId,
    [Required][Range(1, 100)] int Quantity,
    Guid? VenueMapPlaceId = null
);

public record CheckoutSessionDto(
    [property: Required] string SessionUrl
);

public record CreateOrderRequest(
    [Required] Guid EventId,
    [Required] OrderItemRequest[] Items
);

public record OrderDto(
    [property: Required] Guid Id,
    [property: Required] Guid EventId,
    [property: Required] decimal TotalAmount,
    [property: Required] OrderStatus Status,
    [property: Required] DateTime CreatedAt,
    [property: Required] TicketDto[] Tickets
);
