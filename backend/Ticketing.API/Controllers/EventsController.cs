using Microsoft.AspNetCore.Mvc;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;
using Ticketing.Domain.Constants;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService eventService) : ControllerBase
{
    [HttpGet(Name = "getEvents")]
    [ProducesResponseType(typeof(IEnumerable<EventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] EventCategory? category,
        [FromQuery] bool? featured,
        [FromQuery] string? city,
        [FromQuery] string? search,
        [FromQuery] string? date,
        [FromQuery] string? price)
    {
        var filter = new EventsQueryDto(category, featured, city, search, date, price);
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
}
