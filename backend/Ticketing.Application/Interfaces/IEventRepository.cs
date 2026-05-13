using Ticketing.Domain.Entities;
using Ticketing.Application.DTOs;

namespace Ticketing.Application.Interfaces;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(Guid id);
    Task<IEnumerable<Event>> GetAllAsync(EventsQueryDto? filter = null);
    Task<bool> ExistsAsync(Guid id);
    Task SaveChangesAsync();
}
