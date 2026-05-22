using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class UserRepository(TicketingDbContext context) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        var normalized = email.Trim().ToLowerInvariant();
        return context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken);
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.ToList();
        return await context.Users.AsNoTracking().Where(u => idList.Contains(u.Id)).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await context.Users.AddAsync(user, cancellationToken);
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task<User?> GetByInviteTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.InviteToken == token && u.InviteTokenExpires > DateTime.UtcNow, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .AsNoTracking()
            .Where(u => u.Role == role)
            .ToListAsync(cancellationToken);
    }

    public Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        context.Users.Remove(user);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}