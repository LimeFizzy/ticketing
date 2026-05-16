using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/venue-map-places")]
[Authorize]
public class EventVenueMapPlacesController(IEventVenueMapPlaceService mappingService) : ControllerBase
{
    [HttpGet(Name = "getEventVenueMapPlaces")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<EventVenueMapPlaceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMappings(Guid eventId)
    {
        var mappings = await mappingService.GetPublicMappingsAsync(eventId);
        return Ok(mappings);
    }

    [HttpGet("manage", Name = "getManagedEventVenueMapPlaces")]
    [ProducesResponseType(typeof(IEnumerable<EventVenueMapPlaceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetManagedMappings(Guid eventId)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            var mappings = await mappingService.GetMappingsAsync(eventId, organizerId);
            return Ok(mappings);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "You do not own this event" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpPut(Name = "setEventVenueMapPlaces")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SetMappings(Guid eventId, [FromBody] UpdateEventVenueMapPlacesRequest request)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            await mappingService.SetMappingsAsync(eventId, organizerId, request);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "You do not own this event" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
