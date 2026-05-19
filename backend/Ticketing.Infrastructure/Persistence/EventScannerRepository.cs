using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventScannerRepository(TicketingDbContext context) : IEventScannerRepository
{
    public async Task<EventScanner> AddAsync(EventScanner eventScanner)
    {
        await context.EventScanners.AddAsync(eventScanner);
        return eventScanner;
    }

    public async Task<IEnumerable<EventScanner>> GetByEventIdAsync(Guid eventId)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Where(es => es.EventId == eventId)
            .ToListAsync();
    }

    public async Task<IEnumerable<EventScanner>> GetByOrganizerIdAsync(Guid organizerId)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Include(es => es.Event)
            .Where(es => es.OrganizerId == organizerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<EventScanner>> GetByScannerUserIdAsync(Guid scannerUserId)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.Event)
            .Include(es => es.Organizer)
            .Where(es => es.ScannerUserId == scannerUserId)
            .ToListAsync();
    }

    public async Task<bool> IsScannerForEventAsync(Guid scannerUserId, Guid eventId)
    {
        var @event = await context.Events.AsNoTracking()
            .Where(e => e.Id == eventId)
            .Select(e => e.OrganizerId)
            .FirstOrDefaultAsync();

        if (@event == null) return false;

        return await context.EventScanners
            .AsNoTracking()
            .AnyAsync(es => es.ScannerUserId == scannerUserId &&
                (es.EventId == eventId ||
                    (es.AssignToAllEvents && es.OrganizerId == @event)));
    }

    public async Task<EventScanner?> GetByIdAsync(Guid id)
    {
        return await context.EventScanners
            .AsNoTracking()
            .Include(es => es.ScannerUser)
            .Include(es => es.Event)
            .FirstOrDefaultAsync(es => es.Id == id);
    }

    public async Task DeleteAsync(EventScanner eventScanner)
    {
        context.EventScanners.Remove(eventScanner);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
