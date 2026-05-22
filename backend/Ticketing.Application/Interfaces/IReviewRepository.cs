using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByUserAndEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, Review>> GetByUserAndEventsBatchAsync(Guid userId, IEnumerable<Guid> eventIds, CancellationToken cancellationToken = default);
    Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Review> CreateAsync(Review review, CancellationToken cancellationToken = default);
    Task UpdateAsync(Review review, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Review>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<double> GetAverageRatingAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<int> GetReviewCountAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<(double AvgRating, int Count)> GetRatingStatsAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, (double AvgRating, int Count)>> GetRatingsBatchAsync(IEnumerable<Guid> eventIds, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}