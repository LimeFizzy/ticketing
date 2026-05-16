using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;

namespace Ticketing.Infrastructure.Persistence;

public class AnalyticsRepository(TicketingDbContext context) : IAnalyticsRepository
{
    public async Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId)
    {
        var events = await context.Events
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => e.Id)
            .ToListAsync();

        var tickets = await context.Tickets
            .Where(t => events.Contains(t.Order.EventId))
            .ToListAsync();

        var totalRevenue = tickets.Sum(t => t.PricePaid);
        var totalSold = tickets.Count;
        var totalCheckedIn = tickets.Count(t => t.Status == "CheckedIn");
        var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

        return new OrganizerAnalyticsSummaryDto(
            events.Count,
            totalRevenue,
            totalSold,
            totalCheckedIn,
            checkInRate
        );
    }

    public async Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId)
    {
        var @event = await context.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);

        if (@event == null) return null;

        var ticketTypes = await context.EventTicketTypes
            .Where(tt => tt.EventId == eventId)
            .ToListAsync();

        var tickets = await context.Tickets
            .Where(t => t.Order.EventId == eventId)
            .ToListAsync();

        var orders = await context.Orders
            .Where(o => o.EventId == eventId && o.Status == "Confirmed")
            .ToListAsync();

        var totalRevenue = tickets.Sum(t => t.PricePaid);
        var totalSold = tickets.Count;
        var totalCapacity = ticketTypes.Sum(tt => tt.Capacity);
        var totalCheckedIn = tickets.Count(t => t.Status == "CheckedIn");
        var checkInRate = totalSold > 0 ? Math.Round((double)totalCheckedIn / totalSold * 100, 1) : 0;

        var byType = ticketTypes.Select(tt =>
        {
            var sold = tickets.Count(t => t.EventTicketTypeId == tt.Id);
            var revenue = tickets.Where(t => t.EventTicketTypeId == tt.Id).Sum(t => t.PricePaid);
            return new TicketTypeAnalyticsDto(tt.Name, sold, tt.Capacity, revenue);
        }).ToArray();

        var dailySales = orders
            .GroupBy(o => o.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var dayTickets = tickets.Where(t => orders.Where(o => o.CreatedAt.Date == g.Key).SelectMany(o => o.Tickets.Select(tk => tk.Id)).Contains(t.Id)).ToList();
                return new DailySalesDto(g.Key, dayTickets.Count, dayTickets.Sum(t => t.PricePaid));
            }).ToArray();

        return new EventAnalyticsDto(
            eventId,
            @event.Title,
            totalRevenue,
            totalSold,
            totalCapacity,
            totalCheckedIn,
            checkInRate,
            byType,
            dailySales
        );
    }

    public async Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId)
    {
        var events = await context.Events
            .Where(e => e.OrganizerId == organizerId && !e.IsDeleted)
            .Select(e => e.Id)
            .ToListAsync();

        var result = new List<EventAnalyticsDto>();
        foreach (var eventId in events)
        {
            var analytics = await GetEventAnalyticsAsync(eventId, organizerId);
            if (analytics != null) result.Add(analytics);
        }

        return result;
    }

    public async Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId)
    {
        var @event = await context.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId && !e.IsDeleted);

        if (@event == null)
            throw new KeyNotFoundException("Event not found or not owned by you");

        var tickets = await context.Tickets
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

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
