using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class VenueMapRepository(TicketingDbContext context) : IVenueMapRepository
{
    public async Task<VenueMap?> GetByIdAsync(Guid id)
    {
        return await context.VenueMaps
            .Include(vm => vm.Places)
            .Include(vm => vm.Decorations)
            .FirstOrDefaultAsync(vm => vm.Id == id);
    }

    public async Task<IEnumerable<VenueMap>> GetAllAsync()
    {
        return await context.VenueMaps
            .Include(vm => vm.Places)
            .ToListAsync();
    }

    public async Task<VenueMap> CreateAsync(VenueMap venueMap)
    {
        await context.VenueMaps.AddAsync(venueMap);
        await context.SaveChangesAsync();
        return venueMap;
    }

    public async Task UpdateAsync(VenueMap venueMap)
    {
        await context.SaveChangesAsync();
    }

    public async Task ReplaceChildrenAsync(Guid venueMapId, List<VenueMapPlace> newPlaces, List<VenueMapDecoration> newDecorations)
    {
        var existingPlaces = await context.VenueMapPlaces
            .Where(p => p.VenueMapId == venueMapId).ToListAsync();
        var existingDecorations = await context.VenueMapDecorations
            .Where(d => d.VenueMapId == venueMapId).ToListAsync();

        var requestedPlaceIds = newPlaces.Select(p => p.Id).ToHashSet();
        var requestedDecIds = newDecorations.Select(d => d.Id).ToHashSet();

        // Remove places no longer in the request (only if no tickets reference them)
        foreach (var existing in existingPlaces)
        {
            if (!requestedPlaceIds.Contains(existing.Id))
            {
                var hasTickets = await context.Tickets.AnyAsync(t => t.VenueMapPlaceId == existing.Id);
                if (hasTickets)
                    throw new InvalidOperationException($"Cannot remove place '{existing.Label}' — it has sold tickets");
                context.VenueMapPlaces.Remove(existing);
            }
        }

        // Remove decorations no longer in the request
        foreach (var existing in existingDecorations)
        {
            if (!requestedDecIds.Contains(existing.Id))
                context.VenueMapDecorations.Remove(existing);
        }

        // Add or update places
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
                await context.VenueMapPlaces.AddAsync(place);
            }
        }

        // Add or update decorations
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
                await context.VenueMapDecorations.AddAsync(dec);
            }
        }

        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var venueMap = await context.VenueMaps.FindAsync(id);
        if (venueMap != null)
        {
            context.VenueMaps.Remove(venueMap);
            await context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await context.VenueMaps.AnyAsync(vm => vm.Id == id);
    }

    public async Task<VenueMapPlace?> GetPlaceByIdAsync(Guid placeId)
    {
        return await context.VenueMapPlaces.FindAsync(placeId);
    }

    public async Task<int> GetSoldCountForPlaceAsync(Guid venueMapPlaceId)
    {
        return await context.Tickets
            .CountAsync(t => t.VenueMapPlaceId == venueMapPlaceId);
    }

    public async Task<Dictionary<Guid, int>> GetSoldCountsForPlacesBatchAsync(IEnumerable<Guid> placeIds)
    {
        var idList = placeIds.ToList();
        return await context.Tickets
            .Where(t => t.VenueMapPlaceId != null && idList.Contains(t.VenueMapPlaceId.Value))
            .GroupBy(t => t.VenueMapPlaceId!.Value)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<(int SoldCount, int Capacity)> GetPlaceCapacityWithLockAsync(Guid venueMapPlaceId)
    {
        await context.Database.ExecuteSqlRawAsync(
            """SELECT 1 FROM "VenueMapPlaces" WHERE "Id" = {0} FOR UPDATE""",
            venueMapPlaceId);

        var sold = await context.Tickets
            .CountAsync(t => t.VenueMapPlaceId == venueMapPlaceId);

        var place = await context.VenueMapPlaces.FindAsync(venueMapPlaceId)
            ?? throw new InvalidOperationException($"Place {venueMapPlaceId} not found");

        return (sold, place.Capacity);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
