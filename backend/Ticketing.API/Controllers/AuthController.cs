using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IAntiforgery antiforgery) : ControllerBase
{
    [HttpGet("antiforgery-token", Name = "getAntiforgeryToken")]
    [AllowAnonymous]
    public IActionResult GetAntiforgeryToken()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { token = tokens.RequestToken });
    }

    [HttpPost("sign-in", Name = "postSignIn")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SignIn([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await authService.LoginAsync(request, cancellationToken);
        if (user == null) return Unauthorized(new ProblemDetails { Title = "Invalid email or password" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-up", Name = "postSignUp")]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SignUp([FromBody] RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var user = await authService.RegisterAsync(request, cancellationToken);
        if (user == null) return BadRequest(new ProblemDetails { Title = "Email already exists" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpPost("sign-out", Name = "postSignOut")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SignOutEndpoint(CancellationToken cancellationToken = default)
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok();
    }

    [HttpGet("me", Name = "getMe")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken = default)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var userId = this.GetUserIdFromClaims();
        var user = await authService.GetUserByIdAsync(userId, cancellationToken);
        if (user == null) return Unauthorized();

        return Ok(user);
    }

    [HttpPut("profile", Name = "updateProfile")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var result = await authService.UpdateProfileAsync(userId, request, cancellationToken);
        if (result == null) return NotFound(new ProblemDetails { Title = "User not found or email already taken" });

        return Ok(result);
    }

    [HttpPost("invite", Name = "inviteOrganizer")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> InviteOrganizer([FromBody] InviteOrganizerRequest request, CancellationToken cancellationToken = default)
    {
        var adminUserId = this.GetUserIdFromClaims();
        try
        {
            var (user, inviteToken) = await authService.InviteOrganizerAsync(adminUserId, request, cancellationToken);
            return Ok(new { user });
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

    [HttpPost("verify-invite", Name = "verifyInvite")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(VerifyInviteResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyInvite([FromBody] VerifyInviteRequest request, CancellationToken cancellationToken = default)
    {
        var result = await authService.VerifyInviteAsync(request.Token, cancellationToken);
        return Ok(result);
    }

    [HttpPost("accept-invite", Name = "acceptInvite")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteRequest request, CancellationToken cancellationToken = default)
    {
        var user = await authService.AcceptInviteAsync(request, cancellationToken);
        if (user == null) return BadRequest(new ProblemDetails { Title = "Invalid or expired invite token" });

        await SignInUserAsync(user);
        return Ok(user);
    }

    [HttpGet("organizers", Name = "getOrganizers")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IEnumerable<OrganizerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOrganizers(CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        if (!await authService.IsAdminAsync(userId, cancellationToken))
            return StatusCode(403, new ProblemDetails { Title = "Only admins can view organizers" });

        var organizers = await authService.GetOrganizersAsync(cancellationToken);
        return Ok(organizers);
    }

    [HttpDelete("organizers/{id}", Name = "removeOrganizer")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemoveOrganizer(Guid id, CancellationToken cancellationToken = default)
    {
        var adminUserId = this.GetUserIdFromClaims();
        try
        {
            await authService.RemoveOrganizerAsync(id, adminUserId, cancellationToken);
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

    private async Task SignInUserAsync(UserDto user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            AllowRefresh = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);
    }
}
