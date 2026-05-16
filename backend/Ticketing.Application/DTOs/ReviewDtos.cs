using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record ReviewDto(
    [property: Required] Guid Id,
    [property: Required] Guid EventId,
    [property: Required] Guid UserId,
    [property: Required] string UserName,
    [property: Required] int Rating,
    string? Comment,
    [property: Required] DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateReviewRequest(
    [Required] Guid EventId,
    [Range(1, 5)] int Rating,
    string? Comment
);

public record UpdateReviewRequest(
    [Range(1, 5)] int Rating,
    string? Comment
);

public record EventReviewsSummaryDto(
    [property: Required] double AverageRating,
    [property: Required] int TotalReviews,
    [property: Required] ReviewDto[] Reviews,
    [property: Required] int[] RatingDistribution
);

public record ReviewableEventDto(
    [property: Required] Guid EventId,
    [property: Required] string EventTitle,
    [property: Required] DateTime EventDate,
    [property: Required] string ImageUrl,
    ReviewDto? ExistingReview
);
