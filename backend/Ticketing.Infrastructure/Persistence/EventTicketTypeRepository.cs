using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventTicketTypeRepository(TicketingDbContext context) : IEventTicketTypeRepository
{
    public async Task<EventTicketType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.EventTicketTypes.FindAsync([id], cancellationToken);
    }

    public async Task<IEnumerable<EventTicketType>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.EventTicketTypes
            .AsNoTracking()
            .Where(tt => tt.EventId == eventId)
            .ToListAsync(cancellationToken);
    }

    public async Task<EventTicketType> CreateAsync(EventTicketType ticketType, CancellationToken cancellationToken = default)
    {
        await context.EventTicketTypes.AddAsync(ticketType, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return ticketType;
    }

    public async Task UpdateAsync(EventTicketType ticketType, CancellationToken cancellationToken = default)
    {
        context.Entry(ticketType).Property(e => e.RowVersion).OriginalValue = ticketType.RowVersion;
        context.EventTicketTypes.Update(ticketType);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var ticketType = await context.EventTicketTypes.FindAsync([id], cancellationToken);
        if (ticketType != null)
        {
            context.EventTicketTypes.Remove(ticketType);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<int> GetSoldCountAsync(Guid eventTicketTypeId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .AsNoTracking()
            .CountAsync(t => t.EventTicketTypeId == eventTicketTypeId && t.Status != TicketStatus.Cancelled, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetSoldCountsBatchAsync(IEnumerable<Guid> eventTicketTypeIds, CancellationToken cancellationToken = default)
    {
        var idList = eventTicketTypeIds.ToList();
        return await context.Tickets
            .AsNoTracking()
            .Where(t => idList.Contains(t.EventTicketTypeId) && t.Status != TicketStatus.Cancelled)
            .GroupBy(t => t.EventTicketTypeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken);
    }

    public async Task<int> GetSoldCountWithLockAsync(Guid eventTicketTypeId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .CountAsync(t => t.EventTicketTypeId == eventTicketTypeId && t.Status != TicketStatus.Cancelled, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}