using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IVenueMapRepository
{
    Task<VenueMap?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<VenueMap>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<VenueMap> CreateAsync(VenueMap venueMap, CancellationToken cancellationToken = default);
    Task UpdateAsync(VenueMap venueMap, CancellationToken cancellationToken = default);
    Task ReplaceChildrenAsync(Guid venueMapId, List<VenueMapPlace> newPlaces, List<VenueMapDecoration> newDecorations, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VenueMapPlace?> GetPlaceByIdAsync(Guid placeId, CancellationToken cancellationToken = default);
    Task<int> GetSoldCountForPlaceAsync(Guid venueMapPlaceId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, int>> GetSoldCountsForPlacesBatchAsync(IEnumerable<Guid> placeIds, CancellationToken cancellationToken = default);
    Task<(int SoldCount, int Capacity)> GetPlaceCapacityWithLockAsync(Guid venueMapPlaceId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}