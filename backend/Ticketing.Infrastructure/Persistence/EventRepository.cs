using Microsoft.EntityFrameworkCore;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EventRepository(TicketingDbContext context) : IEventRepository
{
    public async Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, cancellationToken);
    }

    public async Task<(IEnumerable<Event> Events, int TotalCount)> GetAllAsync(EventsQueryDto? filter = null, CancellationToken cancellationToken = default)
    {
        var query = context.Events
            .AsNoTracking()
            .AsSplitQuery()
            .Include(e => e.TicketTypes)
            .Where(e => !e.IsDeleted && e.Date >= DateTime.UtcNow);

        if (filter != null)
        {
            if (filter.OrganizerId.HasValue)
                query = query.Where(e => e.OrganizerId == filter.OrganizerId.Value && e.Status == EventStatus.Published);

            if (filter.Status.HasValue)
                query = query.Where(e => e.Status == filter.Status.Value);
            else if (!filter.OrganizerId.HasValue)
                query = query.Where(e => e.Status == EventStatus.Published);

            if (filter.Category.HasValue)
                query = query.Where(e => e.Category == filter.Category.Value);

            if (filter.Featured.HasValue)
                query = query.Where(e => e.Featured == filter.Featured.Value);

            if (!string.IsNullOrEmpty(filter.City))
                query = query.Where(e => EF.Functions.ILike(e.City, EscapeLikeWildcards(filter.City)));

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var searchTerm = $"%{EscapeLikeWildcards(filter.Search)}%";
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
                        query = query.Where(e => e.Date >= now && e.Date < now.AddMonths(1));
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
            query = query.Where(e => e.Status == EventStatus.Published);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = Math.Max(filter?.Page ?? 1, 1);
        var pageSize = Math.Clamp(filter?.PageSize ?? 20, 1, 100);

        var events = await query
            .OrderBy(e => e.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (events, totalCount);
    }

    public async Task<Dictionary<Guid, Event>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.ToList();
        return await context.Events
            .AsNoTracking()
            .Include(e => e.TicketTypes)
            .Where(e => idList.Contains(e.Id) && !e.IsDeleted)
            .ToDictionaryAsync(e => e.Id, cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Events.AsNoTracking().AnyAsync(e => e.Id == id && !e.IsDeleted, cancellationToken);
    }

    public async Task<Event> CreateAsync(Event @event, CancellationToken cancellationToken = default)
    {
        await context.Events.AddAsync(@event, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return @event;
    }

    public async Task UpdateAsync(Event @event, CancellationToken cancellationToken = default)
    {
        context.Events.Update(@event);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var @event = await context.Events.FindAsync([id], cancellationToken);
        if (@event != null)
        {
            @event.IsDeleted = true;
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }

    private static string EscapeLikeWildcards(string input)
    {
        return input.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}