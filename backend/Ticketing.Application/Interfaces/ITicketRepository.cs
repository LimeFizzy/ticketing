using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface ITicketRepository
{
    Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Ticket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Ticket?> GetByCodeWithEventAsync(string ticketCode, CancellationToken cancellationToken = default);
    Task<Ticket?> GetByCodeForCheckInAsync(string ticketCode, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IEnumerable<Ticket>> GetByUserAndEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
    Task<bool> HasTicketForEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}