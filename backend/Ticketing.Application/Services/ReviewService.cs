using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(Guid userId, CreateReviewRequest request);
    Task<ReviewDto?> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewRequest request);
    Task DeleteAsync(Guid reviewId, Guid userId);
    Task<EventReviewsSummaryDto> GetByEventIdAsync(Guid eventId);
    Task<IEnumerable<ReviewableEventDto>> GetReviewableEventsAsync(Guid userId);
}

public class ReviewService(
    IReviewRepository reviewRepository,
    ITicketRepository ticketRepository,
    IUserRepository userRepository,
    IEventRepository eventRepository) : IReviewService
{
    public async Task<ReviewDto> CreateAsync(Guid userId, CreateReviewRequest request)
    {
        var user = await userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        var @event = await eventRepository.GetByIdAsync(request.EventId)
            ?? throw new KeyNotFoundException("Event not found");

        if (@event.Date > DateTime.UtcNow)
            throw new InvalidOperationException("Cannot review an event that hasn't happened yet");

        var hasTicket = await ticketRepository.GetByUserIdAsync(userId);
        if (!hasTicket.Any(t => t.Order.EventId == request.EventId))
            throw new InvalidOperationException("You must have a ticket for this event to review it");

        var existing = await reviewRepository.GetByUserAndEventAsync(userId, request.EventId);
        if (existing != null)
            throw new InvalidOperationException("You have already reviewed this event");

        var review = new Review
        {
            EventId = request.EventId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        var created = await reviewRepository.CreateAsync(review);
        await reviewRepository.SaveChangesAsync();

        return MapToDto(created, user);
    }

    public async Task<ReviewDto?> UpdateAsync(Guid reviewId, Guid userId, UpdateReviewRequest request)
    {
        var review = await reviewRepository.GetByIdAsync(reviewId);
        if (review == null) return null;
        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only update your own reviews");

        review.Rating = request.Rating;
        review.Comment = request.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        await reviewRepository.UpdateAsync(review);
        await reviewRepository.SaveChangesAsync();

        var user = await userRepository.GetByIdAsync(userId)!;
        return MapToDto(review, user!);
    }

    public async Task DeleteAsync(Guid reviewId, Guid userId)
    {
        var review = await reviewRepository.GetByIdAsync(reviewId)
            ?? throw new KeyNotFoundException("Review not found");

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own reviews");

        await reviewRepository.DeleteAsync(reviewId);
        await reviewRepository.SaveChangesAsync();
    }

    public async Task<EventReviewsSummaryDto> GetByEventIdAsync(Guid eventId)
    {
        var reviews = await reviewRepository.GetByEventIdAsync(eventId);
        var reviewList = reviews.ToList();

        var distribution = new int[5];
        foreach (var r in reviewList)
            distribution[r.Rating - 1]++;

        var avgRating = reviewList.Count > 0
            ? reviewList.Average(r => r.Rating)
            : 0;

        var reviewDtos = new List<ReviewDto>();
        foreach (var r in reviewList)
        {
            var user = await userRepository.GetByIdAsync(r.UserId);
            reviewDtos.Add(MapToDto(r, user!));
        }

        return new EventReviewsSummaryDto(
            Math.Round(avgRating, 1),
            reviewList.Count,
            reviewDtos.ToArray(),
            distribution
        );
    }

    public async Task<IEnumerable<ReviewableEventDto>> GetReviewableEventsAsync(Guid userId)
    {
        var tickets = await ticketRepository.GetByUserIdAsync(userId);
        var pastEventIds = tickets
            .Where(t => t.Order.Event.Date < DateTime.UtcNow)
            .Select(t => t.Order.EventId)
            .Distinct()
            .ToList();

        var result = new List<ReviewableEventDto>();
        foreach (var eventId in pastEventIds)
        {
            var @event = await eventRepository.GetByIdAsync(eventId);
            if (@event == null) continue;

            var existingReview = await reviewRepository.GetByUserAndEventAsync(userId, eventId);
            result.Add(new ReviewableEventDto(
                @event.Id,
                @event.Title,
                @event.Date,
                @event.ImageUrl,
                existingReview != null ? MapToDto(existingReview, (await userRepository.GetByIdAsync(userId))!) : null
            ));
        }

        return result.OrderByDescending(r => r.EventDate);
    }

    private static ReviewDto MapToDto(Review review, User user) => new(
        review.Id,
        review.EventId,
        review.UserId,
        $"{user.FirstName} {user.LastName}",
        review.Rating,
        review.Comment,
        review.CreatedAt,
        review.UpdatedAt
    );
}
