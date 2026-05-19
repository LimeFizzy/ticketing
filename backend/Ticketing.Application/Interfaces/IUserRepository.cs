using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetByIdsAsync(IEnumerable<Guid> ids);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task<User?> GetByInviteTokenAsync(string token);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task DeleteAsync(User user);
    Task SaveChangesAsync();
}