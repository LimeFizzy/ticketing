using Hangfire.Dashboard;

namespace Ticketing.API.Services;

public class HangfireDashboardAuthFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true
               && httpContext.User.Claims.Any(c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "Admin");
    }
}
