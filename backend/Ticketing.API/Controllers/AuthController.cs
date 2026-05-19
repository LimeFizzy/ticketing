using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("sign-in", Name = "postSignIn")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SignIn([FromBody] LoginRequest request)
    {
        var hasPassword = await authService.HasPasswordAsync(request.Email);
        if (!hasPassword)
            return StatusCode(403, new ProblemDetails { Title = "Account not activated. Please check your invite email." });

        var user = await authService.LoginAsync(request);
        if (user == null) return Unauthorized(new ProblemDetails { Title = "Invalid email or password" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-up", Name = "postSignUp")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SignUp([FromBody] RegisterRequest request)
    {
        var user = await authService.RegisterAsync(request);
        if (user == null) return BadRequest(new ProblemDetails { Title = "Email already exists" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-out", Name = "postSignOut")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SignOutEndpoint()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    [HttpGet("me", Name = "getMe")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var userId = GetUserIdFromClaims();
        var user = await authService.GetUserByIdAsync(userId);
        if (user == null) return Unauthorized();

        return Ok(user);
    }

    [HttpPut("profile", Name = "updateProfile")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserIdFromClaims();
        var result = await authService.UpdateProfileAsync(userId, request);
        if (result == null) return NotFound(new ProblemDetails { Title = "User not found or email already taken" });

        return Ok(result);
    }

    [HttpPost("invite", Name = "inviteOrganizer")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> InviteOrganizer([FromBody] InviteOrganizerRequest request)
    {
        var adminUserId = GetUserIdFromClaims();
        try
        {
            var (user, inviteToken) = await authService.InviteOrganizerAsync(adminUserId, request);
            return Ok(new { user, inviteToken });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only admins can invite organizers" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpGet("verify-invite", Name = "verifyInvite")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(VerifyInviteResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyInvite([FromQuery] string token)
    {
        var result = await authService.VerifyInviteAsync(token);
        return Ok(result);
    }

    [HttpPost("accept-invite", Name = "acceptInvite")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteRequest request)
    {
        var user = await authService.AcceptInviteAsync(request);
        if (user == null) return BadRequest(new ProblemDetails { Title = "Invalid or expired invite token" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpGet("organizers", Name = "getOrganizers")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<OrganizerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOrganizers()
    {
        var userId = GetUserIdFromClaims();
        if (!await authService.IsAdminAsync(userId))
            return StatusCode(403, new ProblemDetails { Title = "Only admins can view organizers" });

        var organizers = await authService.GetOrganizersAsync();
        return Ok(organizers);
    }

    [HttpDelete("organizers/{id}", Name = "removeOrganizer")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemoveOrganizer(Guid id)
    {
        var adminUserId = GetUserIdFromClaims();
        try
        {
            await authService.RemoveOrganizerAsync(id, adminUserId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Only admins can remove organizers" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    private async Task SignInUserAsync(UserDto user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new("Role", user.Role.ToString())
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
