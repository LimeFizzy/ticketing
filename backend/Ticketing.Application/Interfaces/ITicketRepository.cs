using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface ITicketRepository
{
    Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId);
    Task<Ticket?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code);
    Task SaveChangesAsync();
}
