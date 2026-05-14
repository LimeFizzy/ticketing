using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.API.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IStripeService stripeService) : ControllerBase
{
    [HttpPost("checkout", Name = "createCheckoutSession")]
    [Authorize]
    [EnableRateLimiting("checkout")]
    [ProducesResponseType(typeof(CheckoutSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var email = User.FindFirst(ClaimTypes.Email)?.Value!;

        try
        {
            var session = await stripeService.CreateCheckoutSessionAsync(userId, email, request, cancellationToken);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }
}
