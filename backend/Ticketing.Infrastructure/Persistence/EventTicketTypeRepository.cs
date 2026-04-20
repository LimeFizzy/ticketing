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

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
