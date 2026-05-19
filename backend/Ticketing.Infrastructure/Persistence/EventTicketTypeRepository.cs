using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventTicketTypeRepository(TicketingDbContext context) : IEventTicketTypeRepository
{
    public async Task<EventTicketType?> GetByIdAsync(Guid id)
    {
        return await context.EventTicketTypes.FindAsync(id);
    }

    public async Task<IEnumerable<EventTicketType>> GetByEventIdAsync(Guid eventId)
    {
        return await context.EventTicketTypes
            .Where(tt => tt.EventId == eventId)
            .ToListAsync();
    }

    public async Task<EventTicketType> CreateAsync(EventTicketType ticketType)
    {
        await context.EventTicketTypes.AddAsync(ticketType);
        await context.SaveChangesAsync();
        return ticketType;
    }

    public async Task UpdateAsync(EventTicketType ticketType)
    {
        context.EventTicketTypes.Update(ticketType);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var ticketType = await context.EventTicketTypes.FindAsync(id);
        if (ticketType != null)
        {
            context.EventTicketTypes.Remove(ticketType);
            await context.SaveChangesAsync();
        }
    }

    public async Task<int> GetSoldCountAsync(Guid eventTicketTypeId)
    {
        return await context.Tickets
            .CountAsync(t => t.EventTicketTypeId == eventTicketTypeId);
    }

    public async Task<Dictionary<Guid, int>> GetSoldCountsBatchAsync(IEnumerable<Guid> eventTicketTypeIds)
    {
        var idList = eventTicketTypeIds.ToList();
        return await context.Tickets
            .Where(t => idList.Contains(t.EventTicketTypeId))
            .GroupBy(t => t.EventTicketTypeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<int> GetSoldCountWithLockAsync(Guid eventTicketTypeId)
    {
        await context.Database.ExecuteSqlRawAsync(
            """SELECT 1 FROM "EventTicketTypes" WHERE "Id" = {0} FOR UPDATE""",
            eventTicketTypeId);

        return await context.Tickets
            .CountAsync(t => t.EventTicketTypeId == eventTicketTypeId);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
