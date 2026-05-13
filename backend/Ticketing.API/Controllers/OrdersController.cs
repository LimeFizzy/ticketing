using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    [ProducesResponseType(typeof(CheckoutSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequest request)
    {
        var userId = GetUserIdFromClaims();
        var email = User.FindFirst(ClaimTypes.Email)?.Value!;

        try
        {
            var session = await stripeService.CreateCheckoutSessionAsync(userId, email, request);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
