using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
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
    public async Task SendOrderConfirmationAsync(Guid orderId)
    {
        if (await emailLogRepository.HasBeenSentAsync("OrderConfirmation", orderId: orderId))
            return;

        var order = await orderRepository.GetByIdAsync(orderId);
        if (order == null) return;

        var user = order.User;
        var @event = order.Event;

        var subject = $"Order confirmed: {@event.Title}";
        var body = BuildOrderConfirmationHtml(user, order, @event);

        await SendEmailAsync(user.Email, subject, body, "OrderConfirmation", orderId: orderId, eventId: @event.Id);
    }

    public async Task SendEventReminderAsync(Guid eventId, Guid userId)
    {
        if (await emailLogRepository.HasBeenSentAsync("EventReminder", eventId: eventId))
            return;

        var user = await userRepository.GetByIdAsync(userId);
        var @event = await eventRepository.GetByIdAsync(eventId);
        if (user == null || @event == null) return;

        var subject = $"Reminder: {@event.Title} is tomorrow!";
        var body = BuildReminderHtml(user, @event);

        await SendEmailAsync(user.Email, subject, body, "EventReminder", eventId: eventId);
    }

    public async Task SendCheckInConfirmationAsync(Guid ticketId)
    {
        if (await emailLogRepository.HasBeenSentAsync("CheckInConfirmation", ticketId: ticketId))
            return;

        var ticket = await ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null) return;

        var @event = ticket.Order.Event;
        var user = await userRepository.GetByIdAsync(ticket.UserId);
        if (user == null) return;

        var subject = $"Checked in: {@event.Title}";
        var body = BuildCheckInHtml(user, ticket, @event);

        await SendEmailAsync(user.Email, subject, body, "CheckInConfirmation", ticketId: ticketId, eventId: @event.Id);
    }

    private async Task SendEmailAsync(
        string toEmail, string subject, string htmlBody,
        string emailType,
        Guid? eventId = null, Guid? orderId = null, Guid? ticketId = null)
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
            await client.ConnectAsync(settings.SmtpHost, settings.SmtpPort, true);
            await client.AuthenticateAsync(settings.SmtpUser, settings.SmtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            log.Status = "Sent";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send {EmailType} email to {Email}", emailType, toEmail);
            log.Status = "Failed";
            log.ErrorMessage = ex.Message;
        }

        await emailLogRepository.LogAsync(log);
        await emailLogRepository.SaveChangesAsync();
    }

    private static string BuildOrderConfirmationHtml(User user, Order order, Event @event)
    {
        var ticketRows = order.Tickets.Select(t =>
            $"""<tr><td style="padding:8px;border:1px solid #ddd;">{t.EventTicketType.Name}</td><td style="padding:8px;border:1px solid #ddd;">{t.TicketCode}</td><td style="padding:8px;border:1px solid #ddd;">€{t.PricePaid:F2}</td></tr>"""
        );

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {user.FirstName},</h2>
                <p>Your order for <strong>{@event.Title}</strong> has been confirmed!</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Ticket Type</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Code</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Price</th></tr>
                    {string.Join("\n", ticketRows)}
                    <tr style="font-weight:bold;"><td style="padding:8px;border:1px solid #ddd;" colspan="2">Total</td><td style="padding:8px;border:1px solid #ddd;">€{order.TotalAmount:F2}</td></tr>
                </table>
                <p><strong>Event details:</strong></p>
                <p>{@event.Date:yyyy-MM-dd HH:mm} &bull; {@event.Venue}, {@event.City}</p>
                <p>Your QR codes are available in your TicketFlow account.</p>
                <p>See you there!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private static string BuildReminderHtml(User user, Event @event)
    {
        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {user.FirstName},</h2>
                <p>This is a reminder that <strong>{@event.Title}</strong> is happening tomorrow!</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">{@event.Date:yyyy-MM-dd HH:mm}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Venue</strong></td><td style="padding:8px;border:1px solid #ddd;">{@event.Venue}, {@event.City}</td></tr>
                </table>
                <p>Don't forget to bring your ticket with the QR code!</p>
                <p>See you there!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }

    private static string BuildCheckInHtml(User user, Ticket ticket, Event @event)
    {
        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#1e3a5f;">Hi {user.FirstName},</h2>
                <p>You've been successfully checked in to <strong>{@event.Title}</strong>!</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Event</strong></td><td style="padding:8px;border:1px solid #ddd;">{@event.Title}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Ticket</strong></td><td style="padding:8px;border:1px solid #ddd;">{ticket.TicketCode}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Checked in at</strong></td><td style="padding:8px;border:1px solid #ddd;">{ticket.CheckedInAt:yyyy-MM-dd HH:mm} UTC</td></tr>
                </table>
                <p>Enjoy the event!<br><strong>TicketFlow Team</strong></p>
            </body>
            </html>
            """;
    }
}
