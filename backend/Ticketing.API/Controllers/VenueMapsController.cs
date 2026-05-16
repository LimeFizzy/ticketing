using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/venue-maps")]
public class VenueMapsController(IVenueMapService venueMapService) : ControllerBase
{
    [HttpGet(Name = "getVenueMaps")]
    [ProducesResponseType(typeof(IEnumerable<VenueMapSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var maps = await venueMapService.GetAllAsync();
        return Ok(maps);
    }

    [HttpGet("{id}", Name = "getVenueMapById")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var map = await venueMapService.GetByIdAsync(id);
        if (map == null) return NotFound(new ProblemDetails { Title = "Venue map not found" });
        return Ok(map);
    }

    [HttpPost(Name = "createVenueMap")]
    [Authorize]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateVenueMapRequest request)
    {
        var userId = GetUserIdFromClaims();
        try
        {
            var map = await venueMapService.CreateAsync(userId, request);
            return CreatedAtRoute("getVenueMapById", new { id = map.Id }, map);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only administrators can manage venue maps" });
        }
    }

    [HttpPut("{id}", Name = "updateVenueMap")]
    [Authorize]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVenueMapRequest request)
    {
        var userId = GetUserIdFromClaims();
        try
        {
            var result = await venueMapService.UpdateAsync(id, userId, request);
            if (result == null) return NotFound(new ProblemDetails { Title = "Venue map not found" });
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only administrators can manage venue maps" });
        }
    }

    [HttpDelete("{id}", Name = "deleteVenueMap")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserIdFromClaims();
        try
        {
            await venueMapService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only administrators can manage venue maps" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
