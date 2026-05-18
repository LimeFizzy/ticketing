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
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    }

    public async Task<IEnumerable<Event>> GetAllAsync(EventsQueryDto? filter = null)
    {
        var query = context.Events
            .Include(e => e.TicketTypes)
            .Where(e => !e.IsDeleted && e.Date >= DateTime.UtcNow);

        if (filter != null)
        {
            if (filter.OrganizerId.HasValue)
                query = query.Where(e => e.OrganizerId == filter.OrganizerId.Value);

            if (!string.IsNullOrEmpty(filter.Status))
                query = query.Where(e => e.Status == filter.Status);
            else if (!filter.OrganizerId.HasValue)
                query = query.Where(e => e.Status == "published");

            if (filter.Category.HasValue)
                query = query.Where(e => e.Category == filter.Category.Value);

            if (filter.Featured.HasValue)
                query = query.Where(e => e.Featured == filter.Featured.Value);

            if (!string.IsNullOrEmpty(filter.City))
                query = query.Where(e => e.City == filter.City);

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var searchTerm = $"%{filter.Search}%";
                query = query.Where(e =>
                    EF.Functions.ILike(e.Title, searchTerm) ||
                    EF.Functions.ILike(e.Venue, searchTerm) ||
                    EF.Functions.ILike(e.Description, searchTerm));
            }

            if (!string.IsNullOrEmpty(filter.Date))
            {
                var now = DateTime.UtcNow;
                switch (filter.Date)
                {
                    case "today":
                        query = query.Where(e => e.Date >= now && e.Date < now.AddDays(1));
                        break;
                    case "week":
                        query = query.Where(e => e.Date >= now && e.Date < now.AddDays(7));
                        break;
                    case "month":
                        query = query.Where(e => e.Date >= now && e.Date < now.AddDays(30));
                        break;
                }
            }

            if (!string.IsNullOrEmpty(filter.Price))
            {
                switch (filter.Price)
                {
                    case "under20":
                        query = query.Where(e => e.PriceFrom < 20);
                        break;
                    case "under60":
                        query = query.Where(e => e.PriceFrom < 60);
                        break;
                }
            }
        }
        else
        {
            query = query.Where(e => e.Status == "published");
        }

        return await query.ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await context.Events.AnyAsync(e => e.Id == id && !e.IsDeleted);
    }

    public async Task<Event> CreateAsync(Event @event)
    {
        await context.Events.AddAsync(@event);
        await context.SaveChangesAsync();
        return @event;
    }

    public async Task UpdateAsync(Event @event)
    {
        context.Events.Update(@event);
        await context.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        var @event = await context.Events.FindAsync(id);
        if (@event != null)
        {
            @event.IsDeleted = true;
            await context.SaveChangesAsync();
        }
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
