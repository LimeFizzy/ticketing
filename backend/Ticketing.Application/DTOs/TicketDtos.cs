using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record TicketDto(
    [property: Required] Guid Id,
    [property: Required] string TicketCode,
    [property: Required] Guid EventId,
    [property: Required] Guid EventTicketTypeId,
    [property: Required] string EventTitle,
    [property: Required] string TicketTypeName,
    [property: Required] decimal PricePaid,
    [property: Required] TicketStatus Status,
    [property: Required] DateTime EventDate,
    [property: Required] string Venue,
    [property: Required] string City,
    [property: Required] string ImageUrl,
    DateTime? CheckedInAt = null,
    Guid? VenueMapPlaceId = null,
    string? SeatLabel = null
);

public record CheckInRequest(
    [Required][MaxLength(50)] string TicketCode,
    [Required] Guid EventId
);

public record CheckInResponse(
    [property: Required] TicketDto Ticket,
    [property: Required] bool WasAlreadyCheckedIn
);
