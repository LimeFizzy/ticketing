using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class TicketRepository(TicketingDbContext context) : ITicketRepository
{
    public async Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.VenueMapPlace)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Ticket?> GetByIdAsync(Guid id)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.VenueMapPlace)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Ticket?> GetByCodeWithEventAsync(string ticketCode)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.User)
            .Include(t => t.VenueMapPlace)
            .FirstOrDefaultAsync(t => t.TicketCode == ticketCode);
    }

    public Task<bool> ExistsByCodeAsync(string code)
    {
        return context.Tickets.AnyAsync(t => t.TicketCode == code);
    }

    public async Task<IEnumerable<Ticket>> GetByUserAndEventAsync(Guid userId, Guid eventId)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.VenueMapPlace)
            .Where(t => t.UserId == userId && t.Order.EventId == eventId && t.Status == "Active")
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
