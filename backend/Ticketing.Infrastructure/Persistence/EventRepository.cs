using Microsoft.EntityFrameworkCore;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventRepository(TicketingDbContext context) : IEventRepository
{
    public async Task<Event?> GetByIdAsync(Guid id)
    {
        return await context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Event>> GetAllAsync(EventsQueryDto? filter = null)
    {
        var query = context.Events
            .Include(e => e.TicketTypes)
            .AsQueryable();

        if (filter != null)
        {
            if (filter.Category.HasValue)
                query = query.Where(e => e.Category == filter.Category.Value);

            if (filter.Featured.HasValue)
                query = query.Where(e => e.Featured == filter.Featured.Value);

            if (!string.IsNullOrEmpty(filter.City))
                query = query.Where(e => e.City == filter.City);

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var searchTerm = filter.Search.ToLower();
                query = query.Where(e =>
                    e.Title.ToLower().Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase) ||
                    e.Venue.ToLower().Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase) ||
                    e.Description.ToLower().Contains(searchTerm, StringComparison.InvariantCultureIgnoreCase));
            }
        }

        return await query.ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await context.Events.AnyAsync(e => e.Id == id);
    }
}
