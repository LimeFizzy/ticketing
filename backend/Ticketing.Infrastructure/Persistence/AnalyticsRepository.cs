using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;

namespace Ticketing.Infrastructure.Persistence;

public class AnalyticsRepository(TicketingDbContext context) : IAnalyticsRepository
{
    public async Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        var eventIds = await context.Events
            .AsNoTracking()
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);

        if (eventIds.Count == 0)
            return new OrganizerAnalyticsSummaryDto(0, 0, 0, 0, 0);

        var stats = await context.Tickets
            .AsNoTracking()
            .Where(t => eventIds.Contains(t.Order.EventId))
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Revenue = g.Sum(t => t.PricePaid),
                Sold = g.Count(),
                CheckedIn = g.Count(t => t.Status == TicketStatus.CheckedIn)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalSold = stats?.Sold ?? 0;
        var totalCheckedIn = stats?.CheckedIn ?? 0;
        var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

        return new OrganizerAnalyticsSummaryDto(
            eventIds.Count,
            stats?.Revenue ?? 0,
            totalSold,
            totalCheckedIn,
            checkInRate
        );
    }

    public async Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        var @event = await context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted, cancellationToken);

        if (@event == null) return null;

        var ticketTypes = await context.EventTicketTypes
            .AsNoTracking()
            .Where(tt => tt.EventId == eventId)
            .ToListAsync(cancellationToken);

        var ticketTypeIds = ticketTypes.Select(tt => tt.Id).ToList();

        var byType = await context.Tickets
            .AsNoTracking()
            .Where(t => ticketTypeIds.Contains(t.EventTicketTypeId))
            .GroupBy(t => t.EventTicketTypeId)
            .Select(g => new
            {
                TicketTypeId = g.Key,
                Sold = g.Count(),
                Revenue = g.Sum(t => t.PricePaid)
            })
            .ToDictionaryAsync(x => x.TicketTypeId, x => x, cancellationToken);

        var typeDtos = ticketTypes.Select(tt =>
        {
            var data = byType.GetValueOrDefault(tt.Id);
            return new TicketTypeAnalyticsDto(tt.Name, data?.Sold ?? 0, tt.Capacity, data?.Revenue ?? 0);
        }).ToArray();

        var totalRevenue = typeDtos.Sum(t => t.Revenue);
        var totalSold = typeDtos.Sum(t => t.Sold);
        var totalCapacity = ticketTypes.Sum(tt => tt.Capacity);
        var totalCheckedIn = await context.Tickets
            .AsNoTracking()
            .CountAsync(t => ticketTypeIds.Contains(t.EventTicketTypeId) && t.Status == TicketStatus.CheckedIn, cancellationToken);
        var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

        var dailySales = await context.Orders
            .AsNoTracking()
            .Where(o => o.EventId == eventId && o.Status == OrderStatus.Confirmed)
            .GroupBy(o => o.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DailySalesDto(
                g.Key,
                g.SelectMany(o => o.Tickets).Count(),
                g.SelectMany(o => o.Tickets).Sum(t => t.PricePaid)
            ))
            .ToArrayAsync(cancellationToken);

        return new EventAnalyticsDto(
            eventId,
            @event.Title,
            totalRevenue,
            totalSold,
            totalCapacity,
            totalCheckedIn,
            checkInRate,
            typeDtos,
            dailySales
        );
    }

    public async Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        var events = await context.Events
            .AsNoTracking()
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => new { e.Id, e.Title })
            .ToListAsync(cancellationToken);

        var eventIds = events.Select(e => e.Id).ToList();
        if (eventIds.Count == 0) return [];

        var ticketTypes = await context.EventTicketTypes
            .AsNoTracking()
            .Where(tt => eventIds.Contains(tt.EventId))
            .ToListAsync(cancellationToken);

        var ticketTypeIds = ticketTypes.Select(tt => tt.Id).ToList();

        var byType = await context.Tickets
            .AsNoTracking()
            .Where(t => ticketTypeIds.Contains(t.EventTicketTypeId))
            .GroupBy(t => t.EventTicketTypeId)
            .Select(g => new
            {
                TicketTypeId = g.Key,
                Sold = g.Count(),
                Revenue = g.Sum(t => t.PricePaid)
            })
            .ToDictionaryAsync(x => x.TicketTypeId, x => x, cancellationToken);

        var checkedInByEvent = await context.Tickets
            .AsNoTracking()
            .Where(t => eventIds.Contains(t.Order.EventId) && t.Status == TicketStatus.CheckedIn)
            .GroupBy(t => t.Order.EventId)
            .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken);

        var dailySalesByEvent = await context.Orders
            .AsNoTracking()
            .Where(o => eventIds.Contains(o.EventId) && o.Status == OrderStatus.Confirmed)
            .SelectMany(o => o.Tickets.Select(t => new { o.EventId, o.CreatedAt.Date, t.PricePaid }))
            .GroupBy(x => new { x.EventId, x.Date })
            .GroupBy(g => g.Key.EventId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Select(eg => new DailySalesDto(
                    eg.Key.Date,
                    eg.Count(),
                    eg.Sum(x => x.PricePaid)
                )).OrderBy(d => d.Date).ToArray(),
                cancellationToken
            );

        var eventTitleLookup = events.ToDictionary(e => e.Id, e => e.Title);
        var ticketTypesByEvent = ticketTypes.GroupBy(tt => tt.EventId).ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<EventAnalyticsDto>();

        foreach (var eventId in eventIds)
        {
            var types = ticketTypesByEvent.GetValueOrDefault(eventId) ?? [];

            var typeDtos = types.Select(tt =>
            {
                var data = byType.GetValueOrDefault(tt.Id);
                return new TicketTypeAnalyticsDto(tt.Name, data?.Sold ?? 0, tt.Capacity, data?.Revenue ?? 0);
            }).ToArray();

            var totalRevenue = typeDtos.Sum(t => t.Revenue);
            var totalSold = typeDtos.Sum(t => t.Sold);
            var totalCapacity = types.Sum(tt => tt.Capacity);
            var totalCheckedIn = checkedInByEvent.GetValueOrDefault(eventId);
            var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

            var dailySales = dailySalesByEvent.GetValueOrDefault(eventId, []);

            result.Add(new EventAnalyticsDto(
                eventId,
                eventTitleLookup[eventId],
                totalRevenue,
                totalSold,
                totalCapacity,
                totalCheckedIn,
                checkInRate,
                typeDtos,
                dailySales
            ));
        }

        return result;
    }

    public async Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        var @event = await context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted, cancellationToken) ?? throw new KeyNotFoundException("Event not found or not owned by you");
        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.UTF8, leaveOpen: true);

        await writer.WriteLineAsync("First Name,Last Name,Email,Ticket Type,Ticket Code,Status,Price Paid,Checked In At");

        const int batchSize = 1000;
        var skip = 0;
        while (true)
        {
            var batch = await context.Tickets
                .AsNoTracking()
                .Include(t => t.User)
                .Include(t => t.EventTicketType)
                .Where(t => t.Order.EventId == eventId)
                .OrderBy(t => t.User.LastName)
                .ThenBy(t => t.User.FirstName)
                .Skip(skip)
                .Take(batchSize)
                .ToListAsync(cancellationToken);

            if (batch.Count == 0) break;

            foreach (var t in batch)
            {
                await writer.WriteLineAsync(string.Join(",",
                    EscapeCsv(t.User.FirstName),
                    EscapeCsv(t.User.LastName),
                    EscapeCsv(t.User.Email),
                    EscapeCsv(t.EventTicketType.Name),
                    t.TicketCode,
                    t.Status,
                    t.PricePaid.ToString("F2", CultureInfo.InvariantCulture),
                    t.CheckedInAt?.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) ?? ""
                ));
            }

            skip += batchSize;
        }

        await writer.FlushAsync(cancellationToken);
        return ms.ToArray();
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";

        var trimmed = value.TrimStart();
        if (trimmed.Length > 0 && "=+-@".Contains(trimmed[0]) ||
            value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }
}