namespace Ticketing.Application.DTOs;

public record TicketDto(
    Guid Id,
    string TicketCode,
    Guid EventId,
    Guid EventTicketTypeId,
    string EventTitle,
    string TicketTypeName,
    decimal PricePaid,
    string Status,
    DateTime EventDate,
    string Venue,
    string City,
    string ImageUrl,
    DateTime? CheckedInAt = null
);

public record CheckInRequest(
    string TicketCode,
    Guid EventId
);

public record CheckInResponse(
    TicketDto Ticket,
    bool WasAlreadyCheckedIn
);
