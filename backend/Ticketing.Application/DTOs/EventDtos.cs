using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record EventTicketTypeDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] decimal Price,
    string? Description,
    [property: Required] int Capacity,
    [property: Required] int Sold
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
    string? VenueMapId,
    [property: Required] string Status,
    Guid? OrganizerId
);

public record EventsQueryDto(
    EventCategory? Category,
    bool? Featured,
    string? City,
    string? Search,
    string? Date,
    string? Price,
    Guid? OrganizerId,
    string? Status
);

public record CreateEventRequest(
    [Required] string Title,
    [Required] EventCategory Category,
    [Required] DateTime Date,
    [Required] string Venue,
    [Required] string City,
    string? ImageUrl,
    string? Description,
    string Status,
    CreateEventTicketTypeRequest[]? TicketTypes
);

public record UpdateEventRequest(
    [Required] string Title,
    [Required] EventCategory Category,
    [Required] DateTime Date,
    [Required] string Venue,
    [Required] string City,
    string? ImageUrl,
    string? Description,
    bool Featured,
    string? Disclaimers,
    string? VenueMapId,
    [Required] string Status
);

public record CreateEventTicketTypeRequest(
    [Required] string Name,
    decimal Price,
    string? Description,
    [Range(1, int.MaxValue)] int Capacity
);

public record UpdateEventTicketTypeRequest(
    [Required] string Name,
    decimal Price,
    string? Description,
    [Range(1, int.MaxValue)] int Capacity
);

public record OrganizerEventTicketTypeDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] decimal Price,
    string? Description,
    [property: Required] int Capacity,
    [property: Required] int Sold
);
