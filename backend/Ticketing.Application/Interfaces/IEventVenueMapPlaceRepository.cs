using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventVenueMapPlaceRepository
{
    Task<IEnumerable<EventVenueMapPlace>> GetByEventIdAsync(Guid eventId);
    Task SetMappingsAsync(Guid eventId, IEnumerable<EventVenueMapPlace> mappings);
    Task<EventVenueMapPlace?> GetByEventAndPlaceAsync(Guid eventId, Guid venueMapPlaceId);
    Task SaveChangesAsync();
}
