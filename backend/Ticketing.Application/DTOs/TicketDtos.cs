using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record TicketDto(
    [property: Required] Guid Id,
    [property: Required] string TicketCode,
    [property: Required] Guid EventId,
    [property: Required] Guid EventTicketTypeId,
    [property: Required] string EventTitle,
    [property: Required] string TicketTypeName,
    [property: Required] decimal PricePaid,
    [property: Required] string Status,
    [property: Required] DateTime EventDate,
    [property: Required] string Venue,
    [property: Required] string City,
    [property: Required] string ImageUrl,
    DateTime? CheckedInAt = null
);

public record CheckInRequest(
    string TicketCode,
    Guid EventId
);

public record CheckInResponse(
    [property: Required] TicketDto Ticket,
    [property: Required] bool WasAlreadyCheckedIn
);
