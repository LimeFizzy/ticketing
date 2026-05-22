using Ticketing.Application.DTOs;
using Ticketing.Application.Helpers;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IVenueMapService
{
    Task<VenueMapDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<VenueMapSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<VenueMapDto> CreateAsync(Guid adminUserId, CreateVenueMapRequest request, CancellationToken cancellationToken = default);
    Task<VenueMapDto?> UpdateAsync(Guid id, Guid adminUserId, UpdateVenueMapRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<VenueMapDto?> GetForEventAsync(Guid eventId, CancellationToken cancellationToken = default);
}

public class VenueMapService(
    IVenueMapRepository venueMapRepository,
    IEventRepository eventRepository,
    IUserRepository userRepository) : IVenueMapService
{
    public async Task<VenueMapDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var map = await venueMapRepository.GetByIdAsync(id, cancellationToken);
        return map == null ? null : await MapToDtoAsync(map, cancellationToken);
    }

    public async Task<IEnumerable<VenueMapSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var maps = await venueMapRepository.GetAllAsync(cancellationToken);
        return maps.Select(m => new VenueMapSummaryDto(m.Id, m.Name, m.Places.Sum(p => p.Capacity)));
    }

    public async Task<VenueMapDto> CreateAsync(Guid adminUserId, CreateVenueMapRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAdminAsync(adminUserId, cancellationToken);

        var venueMap = new VenueMap
        {
            Name = request.Name,
            Width = request.Width,
            Height = request.Height,
            CreatedBy = adminUserId,
            Places = request.Places?.Select(p => new VenueMapPlace
            {
                Kind = p.Kind,
                Label = p.Label,
                X = p.X,
                Y = p.Y,
                Width = p.Width,
                Height = p.Height,
                Capacity = p.Capacity
            }).ToList() ?? [],
            Decorations = request.Decorations?.Select(d => new VenueMapDecoration
            {
                X = d.X,
                Y = d.Y,
                Width = d.Width,
                Height = d.Height,
                Label = d.Label
            }).ToList() ?? []
        };

        foreach (var place in venueMap.Places)
        {
            if (place.X < 0 || place.Y < 0 || place.Width <= 0 || place.Height <= 0)
                throw new InvalidOperationException($"Place coordinates must be non-negative with positive dimensions: {place.Label}");
        }

        foreach (var deco in venueMap.Decorations)
        {
            if (deco.X < 0 || deco.Y < 0 || deco.Width <= 0 || deco.Height <= 0)
                throw new InvalidOperationException("Decoration coordinates must be non-negative with positive dimensions");
        }

        var created = await venueMapRepository.CreateAsync(venueMap, cancellationToken);
        return await MapToDtoAsync(created, cancellationToken);
    }

    public async Task<VenueMapDto?> UpdateAsync(Guid id, Guid adminUserId, UpdateVenueMapRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAdminAsync(adminUserId, cancellationToken);

        var map = await venueMapRepository.GetByIdAsync(id, cancellationToken);
        if (map == null) return null;

        map.RowVersion = RowVersionHelper.FromBase64(request.RowVersion);
        map.Name = request.Name;
        map.Width = request.Width;
        map.Height = request.Height;

        var newPlaces = (request.Places ?? [])
            .Select(p => new VenueMapPlace
            {
                Id = p.Id ?? Guid.NewGuid(),
                Kind = p.Kind,
                Label = p.Label,
                X = p.X,
                Y = p.Y,
                Width = p.Width,
                Height = p.Height,
                Capacity = p.Capacity,
                VenueMapId = map.Id
            }).ToList();

        var newDecorations = (request.Decorations ?? [])
            .Select(d => new VenueMapDecoration
            {
                Id = d.Id ?? Guid.NewGuid(),
                X = d.X,
                Y = d.Y,
                Width = d.Width,
                Height = d.Height,
                Label = d.Label,
                VenueMapId = map.Id
            }).ToList();

        await venueMapRepository.ReplaceChildrenAsync(map.Id, newPlaces, newDecorations, cancellationToken);
        await venueMapRepository.UpdateAsync(map, cancellationToken);

        return await MapToDtoAsync(map, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        await ValidateAdminAsync(adminUserId, cancellationToken);

        if (!await venueMapRepository.ExistsAsync(id, cancellationToken))
            throw new InvalidOperationException("Venue map not found");

        await venueMapRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<VenueMapDto?> GetForEventAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (@event?.VenueMapId == null) return null;

        var map = await venueMapRepository.GetByIdAsync(@event.VenueMapId.Value, cancellationToken);
        return map == null ? null : await MapToDtoAsync(map, cancellationToken);
    }

    private async Task ValidateAdminAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (user?.Role != UserRole.Admin)
            throw new UnauthorizedAccessException("Only administrators can manage venue maps");
    }

    private async Task<VenueMapDto> MapToDtoAsync(VenueMap map, CancellationToken cancellationToken)
    {
        var placeIds = map.Places.Select(p => p.Id).ToList();
        var soldCounts = await venueMapRepository.GetSoldCountsForPlacesBatchAsync(placeIds, cancellationToken);

        var placeDtos = map.Places.Select(p =>
        {
            var sold = soldCounts.GetValueOrDefault(p.Id);
            return new VenueMapPlaceDto(
                p.Id, p.Kind, p.Label, p.X, p.Y,
                p.Width, p.Height, p.Capacity, p.Capacity - sold
            );
        }).ToArray();

        var decorationDtos = map.Decorations.Select(d =>
            new VenueMapDecorationDto(d.Id, d.X, d.Y, d.Width, d.Height, d.Label))
            .ToArray();

        return new VenueMapDto(map.Id, map.Name, map.Width, map.Height, decorationDtos, placeDtos, RowVersionHelper.ToBase64(map.RowVersion));
    }
}
