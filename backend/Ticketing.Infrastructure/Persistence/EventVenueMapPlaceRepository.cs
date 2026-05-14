using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventVenueMapPlaceRepository(TicketingDbContext context) : IEventVenueMapPlaceRepository
{
    public async Task<IEnumerable<EventVenueMapPlace>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.EventVenueMapPlaces
            .AsNoTracking()
            .Where(evmp => evmp.EventId == eventId)
            .ToListAsync(cancellationToken);
    }

    public async Task SetMappingsAsync(Guid eventId, IEnumerable<EventVenueMapPlace> mappings, CancellationToken cancellationToken = default)
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var existing = await context.EventVenueMapPlaces
                .Where(evmp => evmp.EventId == eventId)
                .ToListAsync(cancellationToken);

            context.EventVenueMapPlaces.RemoveRange(existing);
            await context.EventVenueMapPlaces.AddRangeAsync(mappings, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<EventVenueMapPlace?> GetByEventAndPlaceAsync(Guid eventId, Guid venueMapPlaceId, CancellationToken cancellationToken = default)
    {
        return await context.EventVenueMapPlaces
            .FirstOrDefaultAsync(evmp => evmp.EventId == eventId && evmp.VenueMapPlaceId == venueMapPlaceId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}