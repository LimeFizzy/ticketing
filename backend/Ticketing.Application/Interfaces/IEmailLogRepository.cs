using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEmailLogRepository
{
    Task<bool> HasBeenSentAsync(string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null, CancellationToken cancellationToken = default);
    Task<bool> HasBeenSentToRecipientAsync(string recipientEmail, string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null, CancellationToken cancellationToken = default);
    Task<EmailLog> LogAsync(EmailLog log, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}