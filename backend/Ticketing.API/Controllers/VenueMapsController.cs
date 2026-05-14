using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/venue-maps")]
public class VenueMapsController(IVenueMapService venueMapService) : ControllerBase
{
    [HttpGet(Name = "getVenueMaps")]
    [EnableRateLimiting("venue-maps")]
    [ProducesResponseType(typeof(IEnumerable<VenueMapSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var maps = await venueMapService.GetAllAsync(cancellationToken);
        return Ok(maps);
    }

    [HttpGet("{id}", Name = "getVenueMapById")]
    [EnableRateLimiting("venue-maps")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var map = await venueMapService.GetByIdAsync(id, cancellationToken);
        if (map == null) return NotFound(new ProblemDetails { Title = "Venue map not found" });
        return Ok(map);
    }

    [HttpPost(Name = "createVenueMap")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateVenueMapRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var map = await venueMapService.CreateAsync(userId, request, cancellationToken);
            return CreatedAtRoute("getVenueMapById", new { id = map.Id }, map);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only administrators can manage venue maps" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpPut("{id}", Name = "updateVenueMap")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(VenueMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVenueMapRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var result = await venueMapService.UpdateAsync(id, userId, request, cancellationToken);
            if (result == null) return NotFound(new ProblemDetails { Title = "Venue map not found" });
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only administrators can manage venue maps" });
        }
    }

    [HttpDelete("{id}", Name = "deleteVenueMap")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            await venueMapService.DeleteAsync(id, userId, cancellationToken);
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
}
