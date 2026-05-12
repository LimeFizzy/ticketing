using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Ticketing.Application.Services;

namespace Ticketing.Infrastructure.Persistence;

public static class DataSeederExtensions
{
    public static async Task SeedDataAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TicketingDbContext>();

        if (await context.Events.AnyAsync()) return;

        var events = DataSeeder.GetMockEvents();

        await context.Events.AddRangeAsync(events);
        await context.SaveChangesAsync();
    }
}
