using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;
using Ticketing.Domain.Constants;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService eventService, IReviewService reviewService, IVenueMapService venueMapService) : ControllerBase
{
    [HttpGet(Name = "getEvents")]
    [EnableRateLimiting("events")]
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
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new EventsQueryDto(category, featured, city, search, date, price, organizerId, status, page, pageSize);
        var events = await eventService.GetAllAsync(filter, cancellationToken);
        return Ok(events);
    }

    [HttpGet("{id}", Name = "getEventById")]
    [EnableRateLimiting("events")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var @event = await eventService.GetByIdAsync(id, cancellationToken);
        if (@event == null) return NotFound(new ProblemDetails { Title = "Event not found" });

        return Ok(@event);
    }

    [HttpPost(Name = "createEvent")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        var @event = await eventService.CreateAsync(organizerId, request, cancellationToken);
        return CreatedAtRoute("getEventById", new { id = @event.Id }, @event);
    }

    [HttpPut("{id}", Name = "updateEvent")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventRequest request, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            var result = await eventService.UpdateAsync(id, organizerId, request, cancellationToken);
            if (result == null) return NotFound(new ProblemDetails { Title = "Event not found" });

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Event not found or not owned by you" });
        }
    }

    [HttpDelete("{id}", Name = "deleteEvent")]
    [Authorize(Roles = "Organizer,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            await eventService.SoftDeleteAsync(id, organizerId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Event not found" });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Event not found or not owned by you" });
        }
    }

    [HttpGet("{id}/reviews", Name = "getEventReviews")]
    [EnableRateLimiting("events")]
    [ProducesResponseType(typeof(EventReviewsSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReviews(Guid id, CancellationToken cancellationToken = default)
    {
        var @event = await eventService.GetByIdAsync(id, cancellationToken);
        if (@event == null) return NotFound(new ProblemDetails { Title = "Event not found" });

        var summary = await reviewService.GetByEventIdAsync(id, cancellationToken);
        return Ok(summary);
    }

    [HttpGet("{id}/venue-map", Name = "getEventVenueMap")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVenueMap(Guid id, CancellationToken cancellationToken = default)
    {
        var venueMap = await venueMapService.GetForEventAsync(id, cancellationToken);
        if (venueMap == null) return NotFound(new ProblemDetails { Title = "No venue map for this event" });
        return Ok(venueMap);
    }
}
