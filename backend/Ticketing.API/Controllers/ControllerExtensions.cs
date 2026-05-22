using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Ticketing.API.Controllers;

internal static class ControllerExtensions
{
    internal static Guid GetUserIdFromClaims(this ControllerBase controller)
    {
        var claim = controller.User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim != null && Guid.TryParse(claim.Value, out var id))
            return id;

        throw new InvalidOperationException("Invalid or missing user identity");
    }
}
