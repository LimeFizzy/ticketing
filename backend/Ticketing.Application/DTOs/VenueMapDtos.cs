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
    [property: Required] VenueMapPlaceDto[] Places
);

public record VenueMapSummaryDto(
    [property: Required] Guid Id,
    [property: Required] string Name,
    [property: Required] int PlaceCount
);

public record CreateVenueMapDecorationRequest(
    Guid? Id,
    [Required] double X,
    [Required] double Y,
    [Required] double Width,
    [Required] double Height,
    [Required] string Label
);

public record CreateVenueMapPlaceRequest(
    Guid? Id,
    [Required] string Kind,
    [Required] string Label,
    [Required] double X,
    [Required] double Y,
    double? Width,
    double? Height,
    [Range(1, int.MaxValue)] int Capacity
);

public record CreateVenueMapRequest(
    [Required] string Name,
    [Required] int Width,
    [Required] int Height,
    CreateVenueMapDecorationRequest[]? Decorations,
    CreateVenueMapPlaceRequest[]? Places
);

public record UpdateVenueMapRequest(
    [Required] string Name,
    [Required] int Width,
    [Required] int Height,
    CreateVenueMapDecorationRequest[]? Decorations,
    CreateVenueMapPlaceRequest[]? Places
);

public record EventVenueMapPlaceDto(
    Guid VenueMapPlaceId,
    Guid EventTicketTypeId
);

public record UpdateEventVenueMapPlacesRequest(
    [Required] EventVenueMapPlaceDto[] Mappings
);
