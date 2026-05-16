using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IEventVenueMapPlaceService
{
    Task<IEnumerable<EventVenueMapPlaceDto>> GetPublicMappingsAsync(Guid eventId);
    Task<IEnumerable<EventVenueMapPlaceDto>> GetMappingsAsync(Guid eventId, Guid organizerId);
    Task SetMappingsAsync(Guid eventId, Guid organizerId, UpdateEventVenueMapPlacesRequest request);
}

public class EventVenueMapPlaceService(
    IEventVenueMapPlaceRepository mappingRepository,
    IEventRepository eventRepository,
    IVenueMapRepository venueMapRepository,
    IEventTicketTypeRepository ticketTypeRepository) : IEventVenueMapPlaceService
{
    public async Task<IEnumerable<EventVenueMapPlaceDto>> GetPublicMappingsAsync(Guid eventId)
    {
        var mappings = await mappingRepository.GetByEventIdAsync(eventId);
        return mappings.Select(m => new EventVenueMapPlaceDto(m.VenueMapPlaceId, m.EventTicketTypeId));
    }

    public async Task<IEnumerable<EventVenueMapPlaceDto>> GetMappingsAsync(Guid eventId, Guid organizerId)
    {
        await ValidateEventOwnershipAsync(eventId, organizerId);
        var mappings = await mappingRepository.GetByEventIdAsync(eventId);
        return mappings.Select(m => new EventVenueMapPlaceDto(m.VenueMapPlaceId, m.EventTicketTypeId));
    }

    public async Task SetMappingsAsync(Guid eventId, Guid organizerId, UpdateEventVenueMapPlacesRequest request)
    {
        var @event = await ValidateEventOwnershipAsync(eventId, organizerId);

        if (@event.VenueMapId == null)
            throw new InvalidOperationException("Event does not have a venue map assigned");

        var venueMap = await venueMapRepository.GetByIdAsync(@event.VenueMapId.Value)
            ?? throw new InvalidOperationException("Venue map not found");

        var placeIds = venueMap.Places.Select(p => p.Id).ToHashSet();
        var ticketTypeIds = (await ticketTypeRepository.GetByEventIdAsync(eventId))
            .Select(tt => tt.Id).ToHashSet();

        var mappings = request.Mappings.Select(m => new EventVenueMapPlace
        {
            EventId = eventId,
            VenueMapPlaceId = m.VenueMapPlaceId,
            EventTicketTypeId = m.EventTicketTypeId
        }).ToList();

        foreach (var m in mappings)
        {
            if (!placeIds.Contains(m.VenueMapPlaceId))
                throw new InvalidOperationException($"Place {m.VenueMapPlaceId} does not belong to this venue map");
            if (!ticketTypeIds.Contains(m.EventTicketTypeId))
                throw new InvalidOperationException($"Ticket type {m.EventTicketTypeId} does not belong to this event");
        }

        await mappingRepository.SetMappingsAsync(eventId, mappings);
    }

    private async Task<Event> ValidateEventOwnershipAsync(Guid eventId, Guid organizerId)
    {
        var @event = await eventRepository.GetByIdAsync(eventId)
            ?? throw new InvalidOperationException("Event not found");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You do not own this event");

        return @event;
    }
}
