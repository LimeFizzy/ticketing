using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventVenueMapPlaceRepository(TicketingDbContext context) : IEventVenueMapPlaceRepository
{
    public async Task<IEnumerable<EventVenueMapPlace>> GetByEventIdAsync(Guid eventId)
    {
        return await context.EventVenueMapPlaces
            .Where(evmp => evmp.EventId == eventId)
            .ToListAsync();
    }

    public async Task SetMappingsAsync(Guid eventId, IEnumerable<EventVenueMapPlace> mappings)
    {
        var existing = await context.EventVenueMapPlaces
            .Where(evmp => evmp.EventId == eventId)
            .ToListAsync();

        context.EventVenueMapPlaces.RemoveRange(existing);
        await context.EventVenueMapPlaces.AddRangeAsync(mappings);
        await context.SaveChangesAsync();
    }

    public async Task<EventVenueMapPlace?> GetByEventAndPlaceAsync(Guid eventId, Guid venueMapPlaceId)
    {
        return await context.EventVenueMapPlaces
            .FirstOrDefaultAsync(evmp => evmp.EventId == eventId && evmp.VenueMapPlaceId == venueMapPlaceId);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
