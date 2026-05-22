using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(Guid userId, CreateReviewRequest request, CancellationToken cancellationToken = default);
    Task<ReviewDto?> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid reviewId, Guid userId, CancellationToken cancellationToken = default);
    Task<EventReviewsSummaryDto> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReviewableEventDto>> GetReviewableEventsAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class ReviewService(
    IReviewRepository reviewRepository,
    ITicketRepository ticketRepository,
    IUserRepository userRepository,
    IEventRepository eventRepository) : IReviewService
{
    public async Task<ReviewDto> CreateAsync(Guid userId, CreateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found");

        var @event = await eventRepository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException("Event not found");

        if (@event.Date > DateTime.UtcNow)
            throw new InvalidOperationException("Cannot review an event that hasn't happened yet");

        var hasTicket = await ticketRepository.HasTicketForEventAsync(userId, request.EventId, cancellationToken);
        if (!hasTicket)
            throw new InvalidOperationException("You must have a ticket for this event to review it");

        var existing = await reviewRepository.GetByUserAndEventAsync(userId, request.EventId, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("You have already reviewed this event");

        var review = new Review
        {
            EventId = request.EventId,
            UserId = userId,
            Rating = request.Rating,
            Comment = SanitizeComment(request.Comment)
        };

        var created = await reviewRepository.CreateAsync(review, cancellationToken);
        await reviewRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(created, user);
    }

    public async Task<ReviewDto?> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var review = await reviewRepository.GetByIdAsync(reviewId, cancellationToken);
        if (review == null) return null;
        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only update your own reviews");

        review.RowVersion = request.RowVersion;
        review.Rating = request.Rating;
        review.Comment = SanitizeComment(request.Comment);
        review.UpdatedAt = DateTime.UtcNow;

        await reviewRepository.UpdateAsync(review, cancellationToken);
        await reviewRepository.SaveChangesAsync(cancellationToken);

        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found");
        return MapToDto(review, user);
    }

    public async Task DeleteAsync(Guid reviewId, Guid userId, CancellationToken cancellationToken = default)
    {
        var review = await reviewRepository.GetByIdAsync(reviewId, cancellationToken)
            ?? throw new KeyNotFoundException("Review not found");

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own reviews");

        await reviewRepository.DeleteAsync(reviewId, cancellationToken);
        await reviewRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<EventReviewsSummaryDto> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var reviews = await reviewRepository.GetByEventIdAsync(eventId, cancellationToken);
        var reviewList = reviews.ToList();

        var userIds = reviewList.Select(r => r.UserId).Distinct().ToList();
        var users = await userRepository.GetByIdsAsync(userIds, cancellationToken);
        var userLookup = users.ToDictionary(u => u.Id);

        var distribution = new int[5];
        foreach (var r in reviewList)
        {
            if (r.Rating >= 1 && r.Rating <= 5)
                distribution[r.Rating - 1]++;
        }

        var avgRating = reviewList.Count > 0
            ? reviewList.Average(r => r.Rating)
            : 0;

        var reviewDtos = reviewList
            .Where(r => userLookup.ContainsKey(r.UserId))
            .Select(r => MapToDto(r, userLookup[r.UserId]))
            .ToArray();

        return new EventReviewsSummaryDto(
            Math.Round(avgRating, 1),
            reviewList.Count,
            reviewDtos,
            distribution
        );
    }

    public async Task<IEnumerable<ReviewableEventDto>> GetReviewableEventsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tickets = await ticketRepository.GetByUserIdAsync(userId, cancellationToken);
        var pastEventIds = tickets
            .Where(t => t.Order.Event.Date < DateTime.UtcNow)
            .Select(t => t.Order.EventId)
            .Distinct()
            .ToList();

        if (pastEventIds.Count == 0) return [];

        var events = await eventRepository.GetByIdsAsync(pastEventIds, cancellationToken);
        var existingReviews = await reviewRepository.GetByUserAndEventsBatchAsync(userId, pastEventIds, cancellationToken);
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);

        return pastEventIds
            .Where(events.ContainsKey)
            .Select(eventId =>
            {
                var evt = events[eventId];
                var review = existingReviews.GetValueOrDefault(eventId);
                return new ReviewableEventDto(
                    evt.Id,
                    evt.Title,
                    evt.Date,
                    evt.ImageUrl,
                    review != null && user != null ? MapToDto(review, user) : null
                );
            })
            .OrderByDescending(r => r.EventDate);
    }

    private static ReviewDto MapToDto(Review review, User user) => new(
        review.Id,
        review.EventId,
        review.UserId,
        $"{user.FirstName} {user.LastName}",
        review.Rating,
        review.Comment,
        review.CreatedAt,
        review.UpdatedAt,
        review.RowVersion
    );

    private static string SanitizeComment(string? comment) =>
        string.IsNullOrWhiteSpace(comment) ? "" : System.Web.HttpUtility.HtmlEncode(comment);
}
