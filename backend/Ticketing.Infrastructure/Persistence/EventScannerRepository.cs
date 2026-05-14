using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventScannerRepository(TicketingDbContext context) : IEventScannerRepository
{
    public async Task<EventScanner> AddAsync(EventScanner eventScanner, CancellationToken cancellationToken = default)
    {
        await context.EventScanners.AddAsync(eventScanner, cancellationToken);
        return eventScanner;
    }

    public async Task<IEnumerable<EventScanner>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Where(es => es.EventId == eventId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EventScanner>> GetByOrganizerIdAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Include(es => es.Event)
            .Where(es => es.OrganizerId == organizerId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<EventScanner>> GetByScannerUserIdAsync(Guid scannerUserId, CancellationToken cancellationToken = default)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.Event)
            .Include(es => es.Organizer)
            .Where(es => es.ScannerUserId == scannerUserId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsScannerForEventAsync(Guid scannerUserId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await context.Events.AsNoTracking()
            .Where(e => e.Id == eventId)
            .Select(e => e.OrganizerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (@event == null) return false;

        return await context.EventScanners
            .AsNoTracking()
            .AnyAsync(es => es.ScannerUserId == scannerUserId &&
                (es.EventId == eventId ||
                    (es.AssignToAllEvents && es.OrganizerId == @event)), cancellationToken);
    }

    public async Task<EventScanner?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Include(es => es.Event)
            .FirstOrDefaultAsync(es => es.Id == id, cancellationToken);
    }

    public async Task DeleteAsync(EventScanner eventScanner, CancellationToken cancellationToken = default)
    {
        context.EventScanners.Remove(eventScanner);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}