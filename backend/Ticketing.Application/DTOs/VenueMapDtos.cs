using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record VenueMapDecorationDto(
    [property: Required] Guid Id,
    [property: Required] double X,
    [property: Required] double Y,
    [property: Required] double Width,
    [property: Required] double Height,
    [property: Required] string Label
);

public record VenueMapPlaceDto(
    [property: Required] Guid Id,
    [property: Required] string Kind,
    [property: Required] string Label,
    [property: Required] double X,
    [property: Required] double Y,
    double? Width,
    double? Height,
    [property: Required] int Capacity,
    [property: Required] int Available
);

public record VenueMapDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] int Width,
    [property: Required] int Height,
    [property: Required] VenueMapDecorationDto[] Decorations,
    [property: Required] VenueMapPlaceDto[] Places,
    string? RowVersion = null
);

public record VenueMapSummaryDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] int PlaceCount
);

public record CreateVenueMapDecorationRequest(
    Guid? Id,
    [Required][Range(0, 10000)] double X,
    [Required][Range(0, 10000)] double Y,
    [Required][Range(0, 10000)] double Width,
    [Required][Range(0, 10000)] double Height,
    [Required][MaxLength(100)] string Label
);

public record CreateVenueMapPlaceRequest(
    Guid? Id,
    [Required][MaxLength(50)] string Kind,
    [Required][MaxLength(100)] string Label,
    [Required][Range(0, 10000)] double X,
    [Required][Range(0, 10000)] double Y,
    [Range(0, 10000)] double? Width,
    [Range(0, 10000)] double? Height,
    [Range(1, int.MaxValue)] int Capacity
);

public record CreateVenueMapRequest(
    [Required][MaxLength(200)] string Name,
    [Required][Range(1, 10000)] int Width,
    [Required][Range(1, 10000)] int Height,
    [MaxLength(500)] CreateVenueMapDecorationRequest[]? Decorations,
    [MaxLength(500)] CreateVenueMapPlaceRequest[]? Places
);

public record UpdateVenueMapRequest(
    [Required][MaxLength(200)] string Name,
    [Required][Range(1, 10000)] int Width,
    [Required][Range(1, 10000)] int Height,
    [MaxLength(500)] CreateVenueMapDecorationRequest[]? Decorations,
    [MaxLength(500)] CreateVenueMapPlaceRequest[]? Places,
    string? RowVersion = null
);

public record EventVenueMapPlaceDto(
    Guid VenueMapPlaceId,
    Guid EventTicketTypeId
);

public record UpdateEventVenueMapPlacesRequest(
    [Required][MaxLength(500)] EventVenueMapPlaceDto[] Mappings
);
