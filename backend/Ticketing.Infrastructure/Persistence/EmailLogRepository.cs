using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class EmailLogRepository(TicketingDbContext context) : IEmailLogRepository
{
    public async Task<bool> HasBeenSentAsync(string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null, CancellationToken cancellationToken = default)
    {
        return await context.EmailLogs
            .AsNoTracking()
            .AnyAsync(e => e.EmailType == emailType
                && (eventId == null || e.EventId == eventId)
                && (orderId == null || e.OrderId == orderId)
                && (ticketId == null || e.TicketId == ticketId)
                && e.Status == "Sent", cancellationToken);
    }

    public async Task<bool> HasBeenSentToRecipientAsync(string recipientEmail, string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null, CancellationToken cancellationToken = default)
    {
        return await context.EmailLogs
            .AsNoTracking()
            .AnyAsync(e => e.RecipientEmail == recipientEmail
                && e.EmailType == emailType
                && (eventId == null || e.EventId == eventId)
                && (orderId == null || e.OrderId == orderId)
                && (ticketId == null || e.TicketId == ticketId)
                && e.Status == "Sent", cancellationToken);
    }

    public async Task<EmailLog> LogAsync(EmailLog log, CancellationToken cancellationToken = default)
    {
        await context.EmailLogs.AddAsync(log, cancellationToken);
        return log;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}