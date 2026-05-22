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
    public async Task SendEventReminders(CancellationToken cancellationToken = default)
    {
        var tomorrow = DateTime.UtcNow.AddDays(1);
        var now = DateTime.UtcNow;

        var upcomingEventIds = await context.Events
            .Where(e => e.Date >= now && e.Date <= tomorrow && !e.IsDeleted && e.Status == EventStatus.Published)
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);

        if (upcomingEventIds.Count == 0) return;

        var eventUsers = await context.Tickets
            .Where(t => upcomingEventIds.Contains(t.Order.EventId) && t.Status == TicketStatus.Active)
            .Select(t => new { t.Order.EventId, t.UserId })
            .Distinct()
            .ToListAsync(cancellationToken);

        var grouped = eventUsers.GroupBy(x => x.EventId);

        var semaphore = new SemaphoreSlim(5);
        var tasks = eventUsers.Select(async entry =>
        {
            await semaphore.WaitAsync(cancellationToken);
            try
            {
                await emailService.SendEventReminderAsync(entry.EventId, entry.UserId, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send reminder for event {EventId} to user {UserId}", entry.EventId, entry.UserId);
            }
            finally
            {
                semaphore.Release();
            }
        });
        await Task.WhenAll(tasks);
    }
}
