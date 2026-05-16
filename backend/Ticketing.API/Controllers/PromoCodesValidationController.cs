using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/promo-codes")]
public class PromoCodesValidationController(IPromoCodeService promoCodeService) : ControllerBase
{
    [HttpPost("validate", Name = "validatePromoCode")]
    [Authorize]
    [ProducesResponseType(typeof(ValidatePromoCodeResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Validate([FromBody] ValidatePromoCodeRequest request)
    {
        var result = await promoCodeService.ValidateAsync(request);
        return Ok(result);
    }
}
