using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Infrastructure.Persistence;

namespace Ticketing.API.Services;

public class EmailBackgroundJobs(
    TicketingDbContext context,
    IEmailService emailService,
    ILogger<EmailBackgroundJobs> logger)
{
    public async Task SendEventReminders()
    {
        var tomorrow = DateTime.UtcNow.AddDays(1);
        var now = DateTime.UtcNow;

        var upcomingEventIds = await context.Events
            .Where(e => e.Date >= now && e.Date <= tomorrow && !e.IsDeleted && e.Status == EventStatus.Published)
            .Select(e => e.Id)
            .ToListAsync();

        foreach (var eventId in upcomingEventIds)
        {
            var userIds = await context.Tickets
                .Where(t => t.Order.EventId == eventId && t.Status == TicketStatus.Active)
                .Select(t => t.UserId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in userIds)
            {
                try
                {
                    await emailService.SendEventReminderAsync(eventId, userId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send reminder for event {EventId} to user {UserId}", eventId, userId);
                }
            }
        }
    }
}
