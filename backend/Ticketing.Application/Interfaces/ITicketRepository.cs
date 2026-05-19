using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface ITicketRepository
{
    Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId);
    Task<Ticket?> GetByIdAsync(Guid id);
    Task<Ticket?> GetByCodeWithEventAsync(string ticketCode);
    Task<bool> ExistsByCodeAsync(string code);
    Task<IEnumerable<Ticket>> GetByUserAndEventAsync(Guid userId, Guid eventId);
    Task<bool> HasTicketForEventAsync(Guid userId, Guid eventId);
    Task SaveChangesAsync();
}
