using System.Net.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public class EmailService(
    IOrderRepository orderRepository,
    ITicketRepository ticketRepository,
    IUserRepository userRepository,
    IEventRepository eventRepository,
    IEmailLogRepository emailLogRepository,
    IOptions<EmailSettings> emailSettings,
    ILogger<EmailService> logger) : IEmailService
{
    public async Task SendOrderConfirmationAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        if (await emailLogRepository.HasBeenSentAsync("OrderConfirmation", orderId: orderId, cancellationToken: cancellationToken))
            return;

        var order = await orderRepository.GetByIdAsync(orderId, cancellationToken);
        if (order == null) return;

        var user = order.User;
        var @event = order.Event;

        var subject = $"Order confirmed: {@event.Title}";
        var body = BuildOrderConfirmationHtml(user, order, @event);

        await SendEmailAsync(user.Email, subject, body, "OrderConfirmation", orderId: orderId, eventId: @event.Id, cancellationToken: cancellationToken);
    }

    public async Task SendEventReminderAsync(Guid eventId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (user == null || @event == null) return;

        var existingLogs = await emailLogRepository.HasBeenSentToRecipientAsync(
            user.Email, "EventReminder", eventId: eventId, cancellationToken: cancellationToken);
        if (existingLogs) return;

        var tickets = await ticketRepository.GetByUserAndEventAsync(userId, eventId, cancellationToken);

        var subject = $"Reminder: {@event.Title} is tomorrow!";
        var body = BuildReminderHtml(user, @event, tickets);

        await SendEmailAsync(user.Email, subject, body, "EventReminder", eventId: eventId, cancellationToken: cancellationToken);
    }

    public async Task SendCheckInConfirmationAsync(Guid ticketId, CancellationToken cancellationToken = default)
    {
        if (await emailLogRepository.HasBeenSentAsync("CheckInConfirmation", ticketId: ticketId, cancellationToken: cancellationToken))
            return;

        var ticket = await ticketRepository.GetByIdAsync(ticketId, cancellationToken);
        if (ticket == null) return;

        var @event = ticket.Order.Event;
        var user = await userRepository.GetByIdAsync(ticket.UserId, cancellationToken);
        if (user == null) return;

        var subject = $"Checked in: {@event.Title}";
        var body = BuildCheckInHtml(user, ticket, @event);

        await SendEmailAsync(user.Email, subject, body, "CheckInConfirmation", ticketId: ticketId, eventId: @event.Id, cancellationToken: cancellationToken);
    }

    public async Task SendOrganizerInvitationAsync(string email, string firstName, string inviteToken, CancellationToken cancellationToken = default)
    {
        var existingLogs = await emailLogRepository.HasBeenSentToRecipientAsync(
            email, "OrganizerInvitation", cancellationToken: cancellationToken);
        if (existingLogs) return;

        var subject = "You're invited to join TicketFlow as an organizer";
        var body = BuildInvitationHtml(firstName, inviteToken);

        await SendEmailAsync(email, subject, body, "OrganizerInvitation", cancellationToken: cancellationToken);
    }

    private async Task SendEmailAsync(
        string toEmail, string subject, string htmlBody,
        string emailType,
        Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null,
        CancellationToken cancellationToken = default)
    {
        var settings = emailSettings.Value;
        var log = new EmailLog
        {
            RecipientEmail = toEmail,
            Subject = subject,
            EmailType = emailType,
            EventId = eventId,
            OrderId = orderId,
            TicketId = ticketId,
            Status = "Sent"
        };

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (_, _, _, _) => true;
            await client.ConnectAsync(settings.SmtpHost, settings.SmtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(settings.SmtpUser, settings.SmtpPass, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            log.Status = "Sent";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send {EmailType} email to {Email}", emailType, toEmail);
            log.Status = "Failed";
            log.ErrorMessage = ex.Message;
        }

        try
        {
            await emailLogRepository.LogAsync(log, cancellationToken);
            await emailLogRepository.SaveChangesAsync(cancellationToken);
        }
        catch (Exception logEx)
        {
            logger.LogError(logEx, "Failed to log email status for {EmailType} to {Email}", emailType, toEmail);
        }
    }

    private string BaseUrl => emailSettings.Value.BaseUrl;

    private string BuildOrderConfirmationHtml(User user, Order order, Event @event)
    {
        var ticketRows = order.Tickets.Select(t =>
            $"""<tr><td style="padding:8px;border:1px solid #ddd;">{HtmlEncode(t.EventTicketType.Name)}</td><td style="padding:8px;border:1px solid #ddd;"><a href="{BaseUrl}/tickets/{t.Id}" style="color:#1e3a5f;text-decoration:none;"><strong>{HtmlEncode(t.TicketCode)}</strong></a></td><td style="padding:8px;border:1px solid #ddd;">€{t.PricePaid:F2}</td></tr>"""
        );

        var dateStr = FormatDateInTimeZone(@event.Date, @event.TimeZone);

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {HtmlEncode(user.FirstName)},</h2>
                <p>Your order for <strong>{HtmlEncode(@event.Title)}</strong> has been confirmed!</p>
                <p><strong>Your tickets:</strong></p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Ticket Type</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Reference</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Price</th></tr>
                    {string.Join("\n", ticketRows)}
                    <tr style="font-weight:bold;"><td style="padding:8px;border:1px solid #ddd;" colspan="2">Total</td><td style="padding:8px;border:1px solid #ddd;">€{order.TotalAmount:F2}</td></tr>
                </table>
                <p><strong>Event details:</strong></p>
                <p>{dateStr} &bull; {HtmlEncode(@event.Venue)}, {HtmlEncode(@event.City)}</p>
                <p>View all your tickets and QR codes in your <a href="{BaseUrl}/tickets" style="color:#1e3a5f;">TicketFlow account</a>.</p>
                <p>See you there!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private string BuildReminderHtml(User user, Event @event, IEnumerable<Ticket> tickets)
    {
        var dateStr = FormatDateInTimeZone(@event.Date, @event.TimeZone);

        var ticketRefs = tickets.ToList();
        var ticketList = ticketRefs.Count > 0
            ? $"""
                <p><strong>Your ticket references:</strong></p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Ticket</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Reference</th></tr>
                    {string.Join("\n", ticketRefs.Select(t =>
                        $"""<tr><td style="padding:8px;border:1px solid #ddd;">{HtmlEncode(t.EventTicketType.Name)}</td><td style="padding:8px;border:1px solid #ddd;"><a href="{BaseUrl}/tickets/{t.Id}" style="color:#1e3a5f;text-decoration:none;"><strong>{HtmlEncode(t.TicketCode)}</strong></a></td></tr>"""
                    ))}
                </table>
                <p>View all your tickets in your <a href="{BaseUrl}/tickets" style="color:#1e3a5f;">TicketFlow account</a>.</p>
                """
            : $"""<p>View your tickets in your <a href="{BaseUrl}/tickets" style="color:#1e3a5f;">TicketFlow account</a>.</p>""";

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {HtmlEncode(user.FirstName)},</h2>
                <p>This is a reminder that <strong>{HtmlEncode(@event.Title)}</strong> is happening tomorrow!</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">{dateStr}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Venue</strong></td><td style="padding:8px;border:1px solid #ddd;">{HtmlEncode(@event.Venue)}, {HtmlEncode(@event.City)}</td></tr>
                </table>
                {ticketList}
                <p>See you there!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private string BuildCheckInHtml(User user, Ticket ticket, Event @event)
    {
        var dateStr = FormatDateInTimeZone(@event.Date, @event.TimeZone);

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {HtmlEncode(user.FirstName)},</h2>
                <p>You've been successfully checked in to <strong>{HtmlEncode(@event.Title)}</strong>!</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Event</strong></td><td style="padding:8px;border:1px solid #ddd;">{HtmlEncode(@event.Title)}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">{dateStr}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Ticket</strong></td><td style="padding:8px;border:1px solid #ddd;"><a href="{BaseUrl}/tickets/{ticket.Id}" style="color:#1e3a5f;text-decoration:none;"><strong>{HtmlEncode(ticket.TicketCode)}</strong></a></td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Checked in at</strong></td><td style="padding:8px;border:1px solid #ddd;">{ticket.CheckedInAt:yyyy-MM-dd HH:mm} UTC</td></tr>
                </table>
                <p>Enjoy the event!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    public async Task SendScannerInvitationAsync(string email, string firstName, string? eventTitle, string inviteToken, CancellationToken cancellationToken = default)
    {
        var scopeLabel = eventTitle != null ? eventTitle : "all events";
        var subject = $"You've been invited to scan tickets for {scopeLabel}";
        var body = BuildScannerInvitationHtml(firstName, eventTitle, inviteToken);

        await SendEmailAsync(email, subject, body, "ScannerInvitation", cancellationToken: cancellationToken);
    }

    private string BuildInvitationHtml(string firstName, string inviteToken)
    {
        var inviteUrl = $"{BaseUrl}/accept-invite?token={inviteToken}";

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {HtmlEncode(firstName)},</h2>
                <p>You've been invited to join <strong>TicketFlow</strong> as an event organizer!</p>
                <p>Set up your account to start creating and managing events:</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Invite link</strong></td><td style="padding:8px;border:1px solid #ddd;"><a href="{inviteUrl}" style="color:#1e3a5f;text-decoration:none;"><strong>Accept your invitation</strong></a></td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Expires</strong></td><td style="padding:8px;border:1px solid #ddd;">7 days</td></tr>
                </table>
                <p>Welcome aboard!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private string BuildScannerInvitationHtml(string firstName, string? eventTitle, string inviteToken)
    {
        var inviteUrl = $"{BaseUrl}/accept-invite?token={inviteToken}";
        var scopeHtml = eventTitle != null
            ? $"for <strong>{HtmlEncode(eventTitle)}</strong>"
            : "for <strong>all events</strong> by the organizer";

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {HtmlEncode(firstName)},</h2>
                <p>You've been invited to scan tickets {scopeHtml} on <strong>TicketFlow</strong>.</p>
                <p>Set up your account to get started:</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Invite link</strong></td><td style="padding:8px;border:1px solid #ddd;"><a href="{inviteUrl}" style="color:#1e3a5f;text-decoration:none;"><strong>Accept your invitation</strong></a></td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Expires</strong></td><td style="padding:8px;border:1px solid #ddd;">7 days</td></tr>
                </table>
                <p>See you at the event!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private string FormatDateInTimeZone(DateTime utcDate, string? timeZoneId)
    {
        if (!string.IsNullOrEmpty(timeZoneId))
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                var localDate = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.SpecifyKind(utcDate, DateTimeKind.Utc), tz);
                var offset = tz.GetUtcOffset(DateTime.SpecifyKind(utcDate, DateTimeKind.Utc));
                var offsetStr = offset.TotalMinutes >= 0
                    ? $"UTC+{offset.Hours}:{offset.Minutes:D2}"
                    : $"UTC{offset.Hours}:{offset.Minutes:D2}";
                return $"{localDate:yyyy-MM-dd HH:mm} ({offsetStr})";
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to format date in timezone {TimeZoneId}", timeZoneId);
            }
        }

        var defaultDate = DateTime.SpecifyKind(utcDate, DateTimeKind.Utc).AddHours(3);
        return $"{defaultDate:yyyy-MM-dd HH:mm} (UTC+3)";
    }

    private static string HtmlEncode(string? value) =>
        string.IsNullOrEmpty(value) ? "" : System.Web.HttpUtility.HtmlEncode(value);
}
