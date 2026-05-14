using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/promo-codes")]
[EnableRateLimiting("promo-codes")]
public class PromoCodesValidationController(IPromoCodeService promoCodeService) : ControllerBase
{
    [HttpPost("validate", Name = "validatePromoCode")]
    [Authorize]
    [ProducesResponseType(typeof(ValidatePromoCodeResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Validate([FromBody] ValidatePromoCodeRequest request, CancellationToken cancellationToken = default)
    {
        var result = await promoCodeService.ValidateAsync(request, cancellationToken);
        return Ok(result);
    }
}
