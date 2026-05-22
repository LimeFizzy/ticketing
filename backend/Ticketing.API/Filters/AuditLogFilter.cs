using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace Ticketing.API.Filters;

public class AuditLogSettings
{
    public bool Enabled { get; set; } = true;
}

public class AuditLogFilter(ILogger<AuditLogFilter> logger, IOptions<AuditLogSettings> settings) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (settings.Value.Enabled)
        {
            var user = context.HttpContext.User;
            var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";
            var email = user.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "N/A";
            var role = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "N/A";
            var controller = context.RouteData.Values["controller"]?.ToString() ?? "Unknown";
            var action = context.RouteData.Values["action"]?.ToString() ?? "Unknown";
            var method = context.HttpContext.Request.Method;
            var path = context.HttpContext.Request.Path;

            logger.LogInformation(
                "AUDIT | {Timestamp} | User: {UserId} ({Email}) | Role: {Role} | {Method} {Controller}.{Action} | Path: {Path}",
                DateTime.UtcNow, userId, email, role, method, controller, action, path);
        }

        await next();
    }
}
