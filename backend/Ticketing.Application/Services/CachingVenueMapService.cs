using Microsoft.Extensions.Caching.Memory;
using Ticketing.Application.DTOs;

namespace Ticketing.Application.Services;

public class CachingVenueMapService(IVenueMapService inner, IMemoryCache cache) : IVenueMapService
{
    private static string CacheKey(Guid id) => $"VenueMap_{id}";

    public async Task<VenueMapDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var key = CacheKey(id);
        if (cache.TryGetValue(key, out VenueMapDto? cached))
            return cached;

        var result = await inner.GetByIdAsync(id, cancellationToken);
        if (result != null)
            cache.Set(key, result, TimeSpan.FromMinutes(10));

        return result;
    }

    public async Task<IEnumerable<VenueMapSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => await inner.GetAllAsync(cancellationToken);

    public async Task<VenueMapDto> CreateAsync(Guid adminUserId, CreateVenueMapRequest request, CancellationToken cancellationToken = default)
        => await inner.CreateAsync(adminUserId, request, cancellationToken);

    public async Task<VenueMapDto?> UpdateAsync(Guid id, Guid adminUserId, UpdateVenueMapRequest request, CancellationToken cancellationToken = default)
    {
        var result = await inner.UpdateAsync(id, adminUserId, request, cancellationToken);
        cache.Remove(CacheKey(id));
        return result;
    }

    public async Task DeleteAsync(Guid id, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        await inner.DeleteAsync(id, adminUserId, cancellationToken);
        cache.Remove(CacheKey(id));
    }

    public async Task<VenueMapDto?> GetForEventAsync(Guid eventId, CancellationToken cancellationToken = default)
        => await inner.GetForEventAsync(eventId, cancellationToken);
}
