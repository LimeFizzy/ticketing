using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class UserRepository(TicketingDbContext context) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email)
    {
        return context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public Task<User?> GetByIdAsync(Guid id)
    {
        return context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetByIdsAsync(IEnumerable<Guid> ids)
    {
        var idList = ids.ToList();
        return await context.Users.Where(u => idList.Contains(u.Id)).ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        await context.Users.AddAsync(user);
    }

    public Task UpdateAsync(User user)
    {
        context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task<User?> GetByInviteTokenAsync(string token)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.InviteToken == token && u.InviteTokenExpires > DateTime.UtcNow);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
    {
        return await context.Users
            .Where(u => u.Role == role)
            .ToListAsync();
    }

    public Task DeleteAsync(User user)
    {
        context.Users.Remove(user);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
