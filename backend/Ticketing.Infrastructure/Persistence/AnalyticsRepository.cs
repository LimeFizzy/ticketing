using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;

namespace Ticketing.Infrastructure.Persistence;

public class AnalyticsRepository(TicketingDbContext context) : IAnalyticsRepository
{
    public async Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId)
    {
        var eventIds = await context.Events
            .AsNoTracking()
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => e.Id)
            .ToListAsync();

        var totalRevenue = await context.Tickets
            .AsNoTracking()
            .Where(t => eventIds.Contains(t.Order.EventId))
            .SumAsync(t => t.PricePaid);

        var totalSold = await context.Tickets
            .AsNoTracking()
            .CountAsync(t => eventIds.Contains(t.Order.EventId));

        var totalCheckedIn = await context.Tickets
            .AsNoTracking()
            .CountAsync(t => eventIds.Contains(t.Order.EventId) && t.Status == TicketStatus.CheckedIn);

        var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

        return new OrganizerAnalyticsSummaryDto(
            eventIds.Count,
            totalRevenue,
            totalSold,
            totalCheckedIn,
            checkInRate
        );
    }

    public async Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId)
    {
        var @event = await context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);

        if (@event == null) return null;

        var ticketTypes = await context.EventTicketTypes
            .AsNoTracking()
            .Where(tt => tt.EventId == eventId)
            .ToListAsync();

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
            .ToDictionaryAsync(x => x.TicketTypeId, x => x);

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
            .CountAsync(t => ticketTypeIds.Contains(t.EventTicketTypeId) && t.Status == TicketStatus.CheckedIn);
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
            .ToArrayAsync();

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

    public async Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId)
    {
        var eventIds = await context.Events
            .AsNoTracking()
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => new { e.Id, e.Title })
            .ToListAsync();

        var result = new List<EventAnalyticsDto>();

        foreach (var ev in eventIds)
        {
            var analytics = await GetEventAnalyticsAsync(ev.Id, organizerId);
            if (analytics != null) result.Add(analytics);
        }

        return result;
    }

    public async Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId)
    {
        var @event = await context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);

        if (@event == null)
            throw new KeyNotFoundException("Event not found or not owned by you");

        var tickets = await context.Tickets
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.EventTicketType)
            .Where(t => t.Order.EventId == eventId)
            .OrderBy(t => t.User.LastName)
            .ThenBy(t => t.User.FirstName)
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("First Name,Last Name,Email,Ticket Type,Ticket Code,Status,Price Paid,Checked In At");

        foreach (var t in tickets)
        {
            csv.AppendLine(string.Join(",",
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

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";

        if (value.Length > 0 && "=+-@\t\r\n".Contains(value[0]) ||
            value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }
}
