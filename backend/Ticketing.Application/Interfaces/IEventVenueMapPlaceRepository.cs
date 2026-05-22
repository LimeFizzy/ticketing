using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventVenueMapPlaceRepository
{
    Task<IEnumerable<EventVenueMapPlace>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task SetMappingsAsync(Guid eventId, IEnumerable<EventVenueMapPlace> mappings, CancellationToken cancellationToken = default);
    Task<EventVenueMapPlace?> GetByEventAndPlaceAsync(Guid eventId, Guid venueMapPlaceId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}