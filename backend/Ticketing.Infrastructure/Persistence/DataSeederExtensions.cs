using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Ticketing.Application.Interfaces;
using Ticketing.Application.Services;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public static class DataSeederExtensions
{
    public static async Task SeedDataAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TicketingDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        Guid adminId = Guid.Empty;

        if (!await context.Users.AnyAsync(u => u.Role == "admin"))
        {
            var admin = new User
            {
                FirstName = "Admin",
                LastName = "TicketFlow",
                Email = "admin@ticketflow.lt",
                PasswordHash = passwordHasher.Hash("Admin123!"),
                Role = "admin"
            };
            await context.Users.AddAsync(admin);
            await context.SaveChangesAsync();
            adminId = admin.Id;
        }
        else
        {
            adminId = await context.Users
                .Where(u => u.Role == "admin")
                .Select(u => u.Id)
                .FirstAsync();
        }

        if (!await context.VenueMaps.AnyAsync())
        {
            var venueMaps = DataSeeder.GetMockVenueMaps(adminId);
            await context.VenueMaps.AddRangeAsync(venueMaps);
        }

        if (!await context.Events.AnyAsync())
        {
            var events = DataSeeder.GetMockEvents();
            await context.Events.AddRangeAsync(events);
        }

        await context.SaveChangesAsync();
    }
}
