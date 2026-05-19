using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;
using Ticketing.Domain.Constants;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService eventService, IReviewService reviewService, IVenueMapService venueMapService) : ControllerBase
{
    [HttpGet(Name = "getEvents")]
    [ProducesResponseType(typeof(PaginatedResult<EventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] EventCategory? category,
        [FromQuery] bool? featured,
        [FromQuery] string? city,
        [FromQuery] string? search,
        [FromQuery] string? date,
        [FromQuery] string? price,
        [FromQuery] Guid? organizerId,
        [FromQuery] EventStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var filter = new EventsQueryDto(category, featured, city, search, date, price, organizerId, status, page, pageSize);
        var events = await eventService.GetAllAsync(filter);
        return Ok(events);
    }

    [HttpGet("{id}", Name = "getEventById")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var @event = await eventService.GetByIdAsync(id);
        if (@event == null) return NotFound(new ProblemDetails { Title = "Event not found" });

        return Ok(@event);
    }

    [HttpPost(Name = "createEvent")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest request)
    {
        var organizerId = GetUserIdFromClaims();
        var @event = await eventService.CreateAsync(organizerId, request);
        return CreatedAtRoute("getEventById", new { id = @event.Id }, @event);
    }

    [HttpPut("{id}", Name = "updateEvent")]
    [Authorize]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventRequest request)
    {
        var organizerId = GetUserIdFromClaims();
        var result = await eventService.UpdateAsync(id, organizerId, request);
        if (result == null) return NotFound(new ProblemDetails { Title = "Event not found or not owned by you" });

        return Ok(result);
    }

    [HttpDelete("{id}", Name = "deleteEvent")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            await eventService.SoftDeleteAsync(id, organizerId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Event not found or not owned by you" });
        }
    }

    [HttpGet("{id}/reviews", Name = "getEventReviews")]
    [ProducesResponseType(typeof(EventReviewsSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(Guid id)
    {
        var summary = await reviewService.GetByEventIdAsync(id);
        return Ok(summary);
    }

    [HttpGet("{id}/venue-map", Name = "getEventVenueMap")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVenueMap(Guid id)
    {
        var venueMap = await venueMapService.GetForEventAsync(id);
        if (venueMap == null) return NotFound(new ProblemDetails { Title = "No venue map for this event" });
        return Ok(venueMap);
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
