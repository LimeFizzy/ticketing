using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByUserAndEventAsync(Guid userId, Guid eventId);
    Task<Review?> GetByIdAsync(Guid id);
    Task<Review> CreateAsync(Review review);
    Task UpdateAsync(Review review);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Review>> GetByEventIdAsync(Guid eventId);
    Task<double> GetAverageRatingAsync(Guid eventId);
    Task<int> GetReviewCountAsync(Guid eventId);
    Task<Dictionary<Guid, (double AvgRating, int Count)>> GetRatingsBatchAsync(IEnumerable<Guid> eventIds);
    Task SaveChangesAsync();
}
