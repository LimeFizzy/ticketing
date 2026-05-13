using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/promo-codes")]
public class PromoCodesController(IPromoCodeService promoCodeService) : ControllerBase
{
    [HttpPost(Name = "createPromoCode")]
    [Authorize]
    [ProducesResponseType(typeof(PromoCodeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] CreatePromoCodeRequest request)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            var promoCode = await promoCodeService.CreateAsync(eventId, organizerId, request);
            return CreatedAtRoute("getPromoCodes", new { eventId }, promoCode);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpGet(Name = "getPromoCodes")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<PromoCodeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            var promoCodes = await promoCodeService.GetByEventIdAsync(eventId, organizerId);
            return Ok(promoCodes);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpDelete("{promoCodeId}", Name = "deletePromoCode")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid eventId, Guid promoCodeId)
    {
        var organizerId = GetUserIdFromClaims();
        try
        {
            await promoCodeService.DeleteAsync(promoCodeId, organizerId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Promo code not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
