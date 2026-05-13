using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEmailLogRepository
{
    Task<bool> HasBeenSentAsync(string emailType, Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null);
    Task<EmailLog> LogAsync(EmailLog log);
    Task SaveChangesAsync();
}
