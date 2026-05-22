using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/scanners")]
[Authorize(Roles = "Organizer,Admin")]
[EnableRateLimiting("scanners")]
public class ScannersController(IScannerService scannerService) : ControllerBase
{
    [HttpPost("invite", Name = "inviteScanner")]
    [ProducesResponseType(typeof(ScannerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InviteScanner(Guid eventId, [FromBody] InviteScannerRequest request, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();

        var actualRequest = request with { EventId = eventId };

        try
        {
            var (scanner, _) = await scannerService.InviteScannerAsync(organizerId, actualRequest, cancellationToken);
            return Ok(scanner);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails { Title = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpGet(Name = "getScannersForEvent")]
    [ProducesResponseType(typeof(IEnumerable<ScannerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetScanners(Guid eventId, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();

        try
        {
            var scanners = await scannerService.GetScannersForEventAsync(organizerId, eventId, cancellationToken);
            return Ok(scanners);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails { Title = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpDelete("{assignmentId}", Name = "removeScanner")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveScanner(Guid eventId, Guid assignmentId, CancellationToken cancellationToken = default)
    {
        var organizerId = this.GetUserIdFromClaims();

        try
        {
            await scannerService.RemoveScannerAsync(organizerId, assignmentId, cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails { Title = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }
}
