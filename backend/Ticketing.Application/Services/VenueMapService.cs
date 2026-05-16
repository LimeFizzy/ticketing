using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IVenueMapService
{
    Task<VenueMapDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<VenueMapSummaryDto>> GetAllAsync();
    Task<VenueMapDto> CreateAsync(Guid adminUserId, CreateVenueMapRequest request);
    Task<VenueMapDto?> UpdateAsync(Guid id, Guid adminUserId, UpdateVenueMapRequest request);
    Task DeleteAsync(Guid id, Guid adminUserId);
    Task<VenueMapDto?> GetForEventAsync(Guid eventId);
}

public class VenueMapService(
    IVenueMapRepository venueMapRepository,
    IEventRepository eventRepository,
    IUserRepository userRepository) : IVenueMapService
{
    public async Task<VenueMapDto?> GetByIdAsync(Guid id)
    {
        var map = await venueMapRepository.GetByIdAsync(id);
        return map == null ? null : await MapToDtoAsync(map);
    }

    public async Task<IEnumerable<VenueMapSummaryDto>> GetAllAsync()
    {
        var maps = await venueMapRepository.GetAllAsync();
        return maps.Select(m => new VenueMapSummaryDto(m.Id, m.Name, m.Places.Count));
    }

    public async Task<VenueMapDto> CreateAsync(Guid adminUserId, CreateVenueMapRequest request)
    {
        await ValidateAdminAsync(adminUserId);

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

        var created = await venueMapRepository.CreateAsync(venueMap);
        return await MapToDtoAsync(created);
    }

    public async Task<VenueMapDto?> UpdateAsync(Guid id, Guid adminUserId, UpdateVenueMapRequest request)
    {
        await ValidateAdminAsync(adminUserId);

        var map = await venueMapRepository.GetByIdAsync(id);
        if (map == null) return null;

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

        await venueMapRepository.ReplaceChildrenAsync(map.Id, newPlaces, newDecorations);
        await venueMapRepository.UpdateAsync(map);

        return await MapToDtoAsync(map);
    }

    public async Task DeleteAsync(Guid id, Guid adminUserId)
    {
        await ValidateAdminAsync(adminUserId);

        if (!await venueMapRepository.ExistsAsync(id))
            throw new InvalidOperationException("Venue map not found");

        await venueMapRepository.DeleteAsync(id);
    }

    public async Task<VenueMapDto?> GetForEventAsync(Guid eventId)
    {
        var @event = await eventRepository.GetByIdAsync(eventId);
        if (@event?.VenueMapId == null) return null;

        var map = await venueMapRepository.GetByIdAsync(@event.VenueMapId.Value);
        return map == null ? null : await MapToDtoAsync(map);
    }

    private async Task ValidateAdminAsync(Guid userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user?.Role != "admin")
            throw new UnauthorizedAccessException("Only administrators can manage venue maps");
    }

    private async Task<VenueMapDto> MapToDtoAsync(VenueMap map)
    {
        var placeDtos = new List<VenueMapPlaceDto>();
        foreach (var p in map.Places)
        {
            var sold = await venueMapRepository.GetSoldCountForPlaceAsync(p.Id);
            placeDtos.Add(new VenueMapPlaceDto(
                p.Id, p.Kind, p.Label, p.X, p.Y,
                p.Width, p.Height, p.Capacity, p.Capacity - sold
            ));
        }

        var decorationDtos = map.Decorations.Select(d =>
            new VenueMapDecorationDto(d.Id, d.X, d.Y, d.Width, d.Height, d.Label))
            .ToArray();

        return new VenueMapDto(map.Id, map.Name, map.Width, map.Height, decorationDtos, placeDtos.ToArray());
    }
}
