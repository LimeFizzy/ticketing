using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/scanner")]
[Authorize]
public class ScannerDashboardController(IScannerService scannerService) : ControllerBase
{
    [HttpGet("events", Name = "getScannerEvents")]
    [ProducesResponseType(typeof(IEnumerable<ScannerEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignedEvents(CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var events = await scannerService.GetAssignedEventsAsync(userId, cancellationToken);
        return Ok(events);
    }

    [HttpGet("status", Name = "getScannerStatus")]
    [ProducesResponseType(typeof(ScannerStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var isScanner = await scannerService.IsScannerAsync(userId, cancellationToken);
        return Ok(new ScannerStatusDto(isScanner));
    }
}
