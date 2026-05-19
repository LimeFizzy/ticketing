using Ticketing.Domain.Entities;
using Ticketing.Application.DTOs;

namespace Ticketing.Application.Interfaces;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(Guid id);
    Task<(IEnumerable<Event> Events, int TotalCount)> GetAllAsync(EventsQueryDto? filter = null);
    Task<bool> ExistsAsync(Guid id);
    Task<Event> CreateAsync(Event @event);
    Task UpdateAsync(Event @event);
    Task SoftDeleteAsync(Guid id);
    Task SaveChangesAsync();
}
