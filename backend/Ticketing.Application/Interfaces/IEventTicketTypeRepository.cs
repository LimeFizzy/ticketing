using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventTicketTypeRepository
{
    Task<EventTicketType?> GetByIdAsync(Guid id);
    Task<IEnumerable<EventTicketType>> GetByEventIdAsync(Guid eventId);
    Task<EventTicketType> CreateAsync(EventTicketType ticketType);
    Task UpdateAsync(EventTicketType ticketType);
    Task DeleteAsync(Guid id);
    Task<int> GetSoldCountAsync(Guid eventTicketTypeId);
    Task SaveChangesAsync();
}
