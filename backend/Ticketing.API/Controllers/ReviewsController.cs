using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/reviews")]
[EnableRateLimiting("reviews")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [HttpPost(Name = "createReview")]
    [Authorize]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var review = await reviewService.CreateAsync(userId, request, cancellationToken);
            return CreatedAtRoute("getEventReviews", new { id = review.EventId }, review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpPut("{reviewId}", Name = "updateReview")]
    [Authorize]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid reviewId, [FromBody] UpdateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var result = await reviewService.UpdateAsync(reviewId, userId, request, cancellationToken);
            if (result == null) return NotFound(new ProblemDetails { Title = "Review not found" });
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpDelete("{reviewId}", Name = "deleteReview")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid reviewId, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            await reviewService.DeleteAsync(reviewId, userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Review not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpGet("reviewable", Name = "getReviewableEvents")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ReviewableEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviewableEvents(CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var events = await reviewService.GetReviewableEventsAsync(userId, cancellationToken);
        return Ok(events);
    }
}
