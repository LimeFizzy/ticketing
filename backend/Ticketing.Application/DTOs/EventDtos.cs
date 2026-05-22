using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record EventTicketTypeDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] decimal Price,
    string? Description,
    [property: Required] int Capacity,
    [property: Required] int Sold,
    string? RowVersion = null
);

public record EventDto(
    [property: Required] Guid Id,
    [property: Required][MaxLength(200)] string Title,
    [property: Required] EventCategory Category,
    [property: Required] DateTime Date,
    [property: Required][MaxLength(200)] string Venue,
    [property: Required][MaxLength(100)] string City,
    [property: Required] decimal PriceFrom,
    [property: Required] EventTicketTypeDto[] TicketTypes,
    [property: Required] string ImageUrl,
    [property: Required] string Description,
    [property: Required] int AvailableTickets,
    [property: Required] bool Featured,
    string[]? Disclaimers,
    Guid? VenueMapId,
    [property: Required] EventStatus Status,
    string? TimeZone,
    double? AverageRating = null,
    int ReviewCount = 0,
    string? RowVersion = null
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
    [Range(1, int.MaxValue)] int Page = 1,
    [Range(1, 100)] int PageSize = 20
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
    [Required][MaxLength(200)] string Title,
    [Required] EventCategory Category,
    [Required] DateTime Date,
    [Required][MaxLength(200)] string Venue,
    [Required][MaxLength(100)] string City,
    [Url][MaxLength(500)] string? ImageUrl,
    [MaxLength(2000)] string? Description,
    EventStatus Status,
    [MinLength(1)][MaxLength(20)] CreateEventTicketTypeRequest[]? TicketTypes,
    [MaxLength(100)] string? TimeZone
);

public record UpdateEventRequest(
    [Required][MaxLength(200)] string Title,
    [Required] EventCategory Category,
    [Required] DateTime Date,
    [Required][MaxLength(200)] string Venue,
    [Required][MaxLength(100)] string City,
    [Url][MaxLength(500)] string? ImageUrl,
    [MaxLength(2000)] string? Description,
    bool Featured,
    [MaxLength(2000)] string? Disclaimers,
    Guid? VenueMapId,
    [Required] EventStatus Status,
    [MaxLength(100)] string? TimeZone,
    string? RowVersion = null
);

public record CreateEventTicketTypeRequest(
    [Required][MaxLength(100)] string Name,
    [Range(0.01, double.MaxValue)] decimal Price,
    [MaxLength(500)] string? Description,
    [Range(1, int.MaxValue)] int Capacity
);

public record UpdateEventTicketTypeRequest(
    [Required][MaxLength(100)] string Name,
    [Range(0.01, double.MaxValue)] decimal Price,
    [MaxLength(500)] string? Description,
    [Range(1, int.MaxValue)] int Capacity,
    string? RowVersion = null
);

public record OrganizerEventTicketTypeDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] decimal Price,
    string? Description,
    [property: Required] int Capacity,
    [property: Required] int Sold,
    string? RowVersion = null
);
