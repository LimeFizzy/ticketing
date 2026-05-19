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
    Guid? VenueMapId,
    [property: Required] EventStatus Status,
    Guid? OrganizerId,
    string? TimeZone,
    double? AverageRating = null,
    int ReviewCount = 0
);

public record EventsQueryDto(
    EventCategory? Category,
    bool? Featured,
    string? City,
    string? Search,
    string? Date,
    string? Price,
    Guid? OrganizerId,
    EventStatus? Status,
    int Page = 1,
    int PageSize = 20
);

public record PaginatedResult<T>(
    [property: Required] IReadOnlyList<T> Items,
    [property: Required] int TotalCount,
    [property: Required] int Page,
    [property: Required] int PageSize
)
{
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

public record CreateEventRequest(
    [Required] string Title,
    [Required] EventCategory Category,
    [Required] DateTime Date,
    [Required] string Venue,
    [Required] string City,
    string? ImageUrl,
    string? Description,
    EventStatus Status,
    CreateEventTicketTypeRequest[]? TicketTypes,
    string? TimeZone
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
    Guid? VenueMapId,
    [Required] EventStatus Status,
    string? TimeZone
);

public record CreateEventTicketTypeRequest(
    [Required] string Name,
    [Range(0, double.MaxValue)] decimal Price,
    string? Description,
    [Range(1, int.MaxValue)] int Capacity
);

public record UpdateEventTicketTypeRequest(
    [Required] string Name,
    [Range(0, double.MaxValue)] decimal Price,
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
