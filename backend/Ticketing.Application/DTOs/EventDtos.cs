using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record EventTicketTypeDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] decimal Price,
    string? Description
);

public record EventDto(
    [property: Required] Guid Id,
    [property: Required] string Title,
    [property: Required] EventCategory Category,
    [property: Required] DateTime Date,
    [property: Required] string Venue,
    [property: Required] string City,
    [property: Required] decimal PriceFrom,
    [property: Required] EventTicketTypeDto[] TicketTypes,
    [property: Required] string ImageUrl,
    [property: Required] string Description,
    [property: Required] int AvailableTickets,
    [property: Required] bool Featured,
    string[]? Disclaimers,
    string? VenueMapId
);

public record EventsQueryDto(
    EventCategory? Category,
    bool? Featured,
    string? City,
    string? Search,
    string? Date,
    string? Price
);
