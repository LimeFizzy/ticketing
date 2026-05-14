using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/analytics")]
[EnableRateLimiting("analytics")]
public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
{
    [HttpGet("summary", Name = "getAnalyticsSummary")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(OrganizerAnalyticsSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        var summary = await analyticsService.GetOrganizerSummaryAsync(organizerId, cancellationToken);
        return Ok(summary);
    }

    [HttpGet("events", Name = "getAllEventAnalytics")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(IEnumerable<EventAnalyticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllEvents(CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        var analytics = await analyticsService.GetAllEventAnalyticsAsync(organizerId, cancellationToken);
        return Ok(analytics);
    }

    [HttpGet("events/{eventId}", Name = "getEventAnalytics")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(EventAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEventAnalytics(Guid eventId, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        var analytics = await analyticsService.GetEventAnalyticsAsync(eventId, organizerId, cancellationToken);
        if (analytics == null) return NotFound(new ProblemDetails { Title = "Event not found or not owned by you" });
        return Ok(analytics);
    }

    [HttpGet("events/{eventId}/attendees/csv", Name = "exportAttendeesCsv")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportAttendeesCsv(Guid eventId, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            var csv = await analyticsService.ExportAttendeesCsvAsync(eventId, organizerId, cancellationToken);
            return File(csv, "text/csv", $"attendees-{eventId}.csv");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Event not found or not owned by you" });
        }
    }
}
