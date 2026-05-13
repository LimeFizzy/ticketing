using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
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

    public async Task AddAsync(User user)
    {
        await context.Users.AddAsync(user);
    }

    public Task UpdateAsync(User user)
    {
        context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}