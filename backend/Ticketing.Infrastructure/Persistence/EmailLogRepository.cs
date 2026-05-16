using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EmailLogRepository(TicketingDbContext context) : IEmailLogRepository
{
    public async Task<bool> HasBeenSentAsync(string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null)
    {
        return await context.EmailLogs
            .AnyAsync(e => e.EmailType == emailType
                && (eventId == null || e.EventId == eventId)
                && (orderId == null || e.OrderId == orderId)
                && (ticketId == null || e.TicketId == ticketId)
                && e.Status == "Sent");
    }

    public async Task<EmailLog> LogAsync(EmailLog log)
    {
        await context.EmailLogs.AddAsync(log);
        return log;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
