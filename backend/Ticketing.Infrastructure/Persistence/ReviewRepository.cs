using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class ReviewRepository(TicketingDbContext context) : IReviewRepository
{
    public async Task<Review?> GetByUserAndEventAsync(Guid userId, Guid eventId)
    {
        return await context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.EventId == eventId);
    }

    public async Task<Review?> GetByIdAsync(Guid id)
    {
        return await context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Review> CreateAsync(Review review)
    {
        await context.Reviews.AddAsync(review);
        return review;
    }

    public Task UpdateAsync(Review review)
    {
        context.Reviews.Update(review);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var review = await context.Reviews.FindAsync(id);
        if (review != null)
            context.Reviews.Remove(review);
    }

    public async Task<IEnumerable<Review>> GetByEventIdAsync(Guid eventId)
    {
        return await context.Reviews
            .Include(r => r.User)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<double> GetAverageRatingAsync(Guid eventId)
    {
        return await context.Reviews
            .Where(r => r.EventId == eventId)
            .AverageAsync(r => (double?)r.Rating) ?? 0;
    }

    public async Task<int> GetReviewCountAsync(Guid eventId)
    {
        return await context.Reviews
            .CountAsync(r => r.EventId == eventId);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
