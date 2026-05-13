using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record CreateOrderRequest(
    [Required] Guid EventId,
    [Required] OrderItemRequest[] Items
);

public record OrderItemRequest(
    [Required] Guid EventTicketTypeId,
    [Required] int Quantity
);

public record OrderDto(
    [property: Required] Guid Id,
    [property: Required] Guid EventId,
    [property: Required] decimal TotalAmount,
    [property: Required] string Status,
    [property: Required] DateTime CreatedAt,
    [property: Required] TicketDto[] Tickets
);
