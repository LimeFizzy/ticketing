using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventScannerRepository
{
    Task<EventScanner> AddAsync(EventScanner eventScanner);
    Task<IEnumerable<EventScanner>> GetByEventIdAsync(Guid eventId);
    Task<IEnumerable<EventScanner>> GetByOrganizerIdAsync(Guid organizerId);
    Task<IEnumerable<EventScanner>> GetByScannerUserIdAsync(Guid scannerUserId);
    Task<bool> IsScannerForEventAsync(Guid scannerUserId, Guid eventId);
    Task<EventScanner?> GetByIdAsync(Guid id);
    Task DeleteAsync(EventScanner eventScanner);
    Task SaveChangesAsync();
}
