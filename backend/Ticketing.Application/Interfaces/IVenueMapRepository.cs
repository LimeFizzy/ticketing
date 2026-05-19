using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IVenueMapRepository
{
    Task<VenueMap?> GetByIdAsync(Guid id);
    Task<IEnumerable<VenueMap>> GetAllAsync();
    Task<VenueMap> CreateAsync(VenueMap venueMap);
    Task UpdateAsync(VenueMap venueMap);
    Task ReplaceChildrenAsync(Guid venueMapId, List<VenueMapPlace> newPlaces, List<VenueMapDecoration> newDecorations);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<VenueMapPlace?> GetPlaceByIdAsync(Guid placeId);
    Task<int> GetSoldCountForPlaceAsync(Guid venueMapPlaceId);
    Task<Dictionary<Guid, int>> GetSoldCountsForPlacesBatchAsync(IEnumerable<Guid> placeIds);
    Task<(int SoldCount, int Capacity)> GetPlaceCapacityWithLockAsync(Guid venueMapPlaceId);
    Task SaveChangesAsync();
}
