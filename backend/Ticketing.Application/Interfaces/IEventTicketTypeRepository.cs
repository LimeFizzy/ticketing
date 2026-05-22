using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventTicketTypeRepository
{
    Task<EventTicketType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventTicketType>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<EventTicketType> CreateAsync(EventTicketType ticketType, CancellationToken cancellationToken = default);
    Task UpdateAsync(EventTicketType ticketType, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> GetSoldCountAsync(Guid eventTicketTypeId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, int>> GetSoldCountsBatchAsync(IEnumerable<Guid> eventTicketTypeIds, CancellationToken cancellationToken = default);
    Task<int> GetSoldCountWithLockAsync(Guid eventTicketTypeId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}