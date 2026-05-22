using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class VenueMapRepository(TicketingDbContext context) : IVenueMapRepository
{
    public async Task<VenueMap?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.VenueMaps
            .AsNoTracking()
            .Include(vm => vm.Places)
            .Include(vm => vm.Decorations)
            .FirstOrDefaultAsync(vm => vm.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<VenueMap>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.VenueMaps
            .AsNoTracking()
            .Include(vm => vm.Places)
            .ToListAsync(cancellationToken);
    }

    public async Task<VenueMap> CreateAsync(VenueMap venueMap, CancellationToken cancellationToken = default)
    {
        await context.VenueMaps.AddAsync(venueMap, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return venueMap;
    }

    public async Task UpdateAsync(VenueMap venueMap, CancellationToken cancellationToken = default)
    {
        context.Entry(venueMap).Property(v => v.RowVersion).OriginalValue = venueMap.RowVersion;
        context.VenueMaps.Update(venueMap);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task ReplaceChildrenAsync(Guid venueMapId, List<VenueMapPlace> newPlaces, List<VenueMapDecoration> newDecorations, CancellationToken cancellationToken = default)
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await ReplaceChildrenCoreAsync(venueMapId, newPlaces, newDecorations, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task ReplaceChildrenCoreAsync(Guid venueMapId, List<VenueMapPlace> newPlaces, List<VenueMapDecoration> newDecorations, CancellationToken cancellationToken = default)
    {
        var existingPlaces = await context.VenueMapPlaces
            .Where(p => p.VenueMapId == venueMapId).ToListAsync(cancellationToken);
        var existingDecorations = await context.VenueMapDecorations
            .Where(d => d.VenueMapId == venueMapId).ToListAsync(cancellationToken);

        var requestedPlaceIds = newPlaces.Select(p => p.Id).ToHashSet();
        var requestedDecIds = newDecorations.Select(d => d.Id).ToHashSet();

        var placesToRemove = existingPlaces
            .Where(p => !requestedPlaceIds.Contains(p.Id))
            .ToList();

        if (placesToRemove.Count > 0)
        {
            var removeIds = placesToRemove.Select(p => p.Id).ToList();
            var placesWithTickets = await context.Tickets
                .AsNoTracking()
                .Where(t => t.VenueMapPlaceId != null && removeIds.Contains(t.VenueMapPlaceId.Value))
                .Select(t => t.VenueMapPlaceId!.Value)
                .Distinct()
                .ToHashSetAsync(cancellationToken);

            foreach (var existing in placesToRemove)
            {
                if (placesWithTickets.Contains(existing.Id))
                    throw new InvalidOperationException($"Cannot remove place '{existing.Label}' — it has sold tickets");
                context.VenueMapPlaces.Remove(existing);
            }
        }

        foreach (var existing in existingDecorations)
        {
            if (!requestedDecIds.Contains(existing.Id))
                context.VenueMapDecorations.Remove(existing);
        }

        foreach (var place in newPlaces)
        {
            var existing = existingPlaces.FirstOrDefault(p => p.Id == place.Id);
            if (existing != null)
            {
                existing.Kind = place.Kind;
                existing.Label = place.Label;
                existing.X = place.X;
                existing.Y = place.Y;
                existing.Width = place.Width;
                existing.Height = place.Height;
                existing.Capacity = place.Capacity;
            }
            else
            {
                await context.VenueMapPlaces.AddAsync(place, cancellationToken);
            }
        }

        foreach (var dec in newDecorations)
        {
            var existing = existingDecorations.FirstOrDefault(d => d.Id == dec.Id);
            if (existing != null)
            {
                existing.X = dec.X;
                existing.Y = dec.Y;
                existing.Width = dec.Width;
                existing.Height = dec.Height;
                existing.Label = dec.Label;
            }
            else
            {
                await context.VenueMapDecorations.AddAsync(dec, cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var venueMap = await context.VenueMaps.FindAsync([id], cancellationToken);
        if (venueMap != null)
        {
            context.VenueMaps.Remove(venueMap);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.VenueMaps.AsNoTracking().AnyAsync(vm => vm.Id == id, cancellationToken);
    }

    public async Task<VenueMapPlace?> GetPlaceByIdAsync(Guid placeId, CancellationToken cancellationToken = default)
    {
        return await context.VenueMapPlaces.FindAsync([placeId], cancellationToken);
    }

    public async Task<int> GetSoldCountForPlaceAsync(Guid venueMapPlaceId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .AsNoTracking()
            .CountAsync(t => t.VenueMapPlaceId == venueMapPlaceId, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetSoldCountsForPlacesBatchAsync(IEnumerable<Guid> placeIds, CancellationToken cancellationToken = default)
    {
        var idList = placeIds.ToList();
        return await context.Tickets
            .AsNoTracking()
            .Where(t => t.VenueMapPlaceId != null && idList.Contains(t.VenueMapPlaceId.Value))
            .GroupBy(t => t.VenueMapPlaceId!.Value)
            .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken);
    }

    public async Task<(int SoldCount, int Capacity)> GetPlaceCapacityWithLockAsync(Guid venueMapPlaceId, CancellationToken cancellationToken = default)
    {
        var sold = await context.Tickets
            .CountAsync(t => t.VenueMapPlaceId == venueMapPlaceId, cancellationToken);

        var place = await context.VenueMapPlaces.FindAsync([venueMapPlaceId], cancellationToken)
            ?? throw new InvalidOperationException($"Place {venueMapPlaceId} not found");

        return (sold, place.Capacity);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}