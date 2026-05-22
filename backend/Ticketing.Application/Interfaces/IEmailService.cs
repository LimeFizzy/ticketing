namespace Ticketing.Application.Interfaces;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task SendEventReminderAsync(Guid eventId, Guid userId, CancellationToken cancellationToken = default);
    Task SendCheckInConfirmationAsync(Guid ticketId, CancellationToken cancellationToken = default);
    Task SendOrganizerInvitationAsync(string email, string firstName, string inviteToken, CancellationToken cancellationToken = default);
}
