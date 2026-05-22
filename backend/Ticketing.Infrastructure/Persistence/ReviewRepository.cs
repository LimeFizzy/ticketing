using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class ReviewRepository(TicketingDbContext context) : IReviewRepository
{
    public async Task<Review?> GetByUserAndEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Reviews
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.EventId == eventId, cancellationToken);
    }

    public async Task<Dictionary<Guid, Review>> GetByUserAndEventsBatchAsync(Guid userId, IEnumerable<Guid> eventIds, CancellationToken cancellationToken = default)
    {
        var idList = eventIds.ToList();
        return await context.Reviews
            .AsNoTracking()
            .Where(r => r.UserId == userId && idList.Contains(r.EventId))
            .ToDictionaryAsync(r => r.EventId, cancellationToken);
    }

    public async Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Review> CreateAsync(Review review, CancellationToken cancellationToken = default)
    {
        await context.Reviews.AddAsync(review, cancellationToken);
        return review;
    }

    public Task UpdateAsync(Review review, CancellationToken cancellationToken = default)
    {
        context.Entry(review).Property(r => r.RowVersion).OriginalValue = review.RowVersion;
        context.Reviews.Update(review);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var review = await context.Reviews.FindAsync([id], cancellationToken);
        if (review != null)
            context.Reviews.Remove(review);
    }

    public async Task<IEnumerable<Review>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<double> GetAverageRatingAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Reviews
            .Where(r => r.EventId == eventId)
            .AverageAsync(r => (double?)r.Rating, cancellationToken) ?? 0;
    }

    public async Task<int> GetReviewCountAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Reviews
            .CountAsync(r => r.EventId == eventId, cancellationToken);
    }

    public async Task<(double AvgRating, int Count)> GetRatingStatsAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var result = await context.Reviews
            .Where(r => r.EventId == eventId)
            .GroupBy(_ => 1)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync(cancellationToken);

        return result != null ? (result.Avg, result.Count) : (0, 0);
    }

    public async Task<Dictionary<Guid, (double AvgRating, int Count)>> GetRatingsBatchAsync(IEnumerable<Guid> eventIds, CancellationToken cancellationToken = default)
    {
        var idList = eventIds.ToList();
        return await context.Reviews
            .Where(r => idList.Contains(r.EventId))
            .GroupBy(r => r.EventId)
            .ToDictionaryAsync(
                g => g.Key,
                g => (g.Average(r => (double)r.Rating), g.Count()),
                cancellationToken
            );
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}