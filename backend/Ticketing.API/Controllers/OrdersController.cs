using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost(Name = "createOrder")]
    [Authorize]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserIdFromClaims();
        var order = await orderService.CreateOrderAsync(userId, request);
        return CreatedAtAction(nameof(CreateOrder), new { id = order.Id }, order);
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
