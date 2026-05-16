using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
{
    [HttpGet("summary", Name = "getAnalyticsSummary")]
    [Authorize]
    [ProducesResponseType(typeof(OrganizerAnalyticsSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var organizerId = GetUserIdFromClaims();
        var summary = await analyticsService.GetOrganizerSummaryAsync(organizerId);
        return Ok(summary);
    }

    [HttpGet("events", Name = "getAllEventAnalytics")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<EventAnalyticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllEvents()
    {
        var organizerId = GetUserIdFromClaims();
        var analytics = await analyticsService.GetAllEventAnalyticsAsync(organizerId);
        return Ok(analytics);
    }

    [HttpGet("events/{eventId}", Name = "getEventAnalytics")]
    [Authorize]
    [ProducesResponseType(typeof(EventAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEventAnalytics(Guid eventId)
    {
        var organizerId = GetUserIdFromClaims();
        var analytics = await analyticsService.GetEventAnalyticsAsync(eventId, organizerId);
        if (analytics == null) return NotFound(new ProblemDetails { Title = "Event not found or not owned by you" });
        return Ok(analytics);
    }

    [HttpGet("events/{eventId}/attendees/csv", Name = "exportAttendeesCsv")]
    [Authorize]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportAttendeesCsv(Guid eventId)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            var csv = await analyticsService.ExportAttendeesCsvAsync(eventId, organizerId);
            return File(csv, "text/csv", $"attendees-{eventId}.csv");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Event not found or not owned by you" });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
