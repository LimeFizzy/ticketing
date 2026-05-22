using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record ReviewDto(
    [property: Required] Guid Id,
    [property: Required] Guid EventId,
    [property: Required] Guid UserId,
    [property: Required] string UserName,
    [property: Required, Range(1, 5)] int Rating,
    [MaxLength(2000)] string? Comment,
    [property: Required] DateTime CreatedAt,
    DateTime? UpdatedAt,
    [property: Required] string RowVersion
);

public record CreateReviewRequest(
    [Required] Guid EventId,
    [Required, Range(1, 5)] int Rating,
    [MaxLength(2000)] string? Comment
);

public record UpdateReviewRequest(
    [Required, Range(1, 5)] int Rating,
    [MaxLength(2000)] string? Comment,
    [property: Required] string RowVersion
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
