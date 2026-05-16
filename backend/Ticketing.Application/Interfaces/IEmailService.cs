namespace Ticketing.Application.Interfaces;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(Guid orderId);
    Task SendEventReminderAsync(Guid eventId, Guid userId);
    Task SendCheckInConfirmationAsync(Guid ticketId);
}
