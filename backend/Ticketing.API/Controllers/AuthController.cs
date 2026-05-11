using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn([FromBody] LoginRequest request)
    {
        var user = await authService.LoginAsync(request);
        if (user == null) return Unauthorized(new { message = "Invalid email or password" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp([FromBody] RegisterRequest request)
    {
        var user = await authService.RegisterAsync(request);
        if (user == null) return BadRequest(new { message = "Email already exists" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-out")]
    public async Task<IActionResult> SignOutEndpoint()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    [HttpGet("me")]
    public IActionResult GetMe()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var firstName = User.FindFirst(ClaimTypes.Name)?.Value;
        var lastName = User.FindFirst(ClaimTypes.Surname)?.Value;

        return Ok(new UserDto(Guid.Parse(userId!), firstName!, lastName!, email!));
    }

    private async Task SignInUserAsync(UserDto user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FirstName),
            new(ClaimTypes.Surname, user.LastName)
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);
    }
}