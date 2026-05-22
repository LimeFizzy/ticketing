using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IEventScannerRepository
{
    Task<EventScanner> AddAsync(EventScanner eventScanner, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventScanner>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventScanner>> GetByOrganizerIdAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventScanner>> GetByScannerUserIdAsync(Guid scannerUserId, CancellationToken cancellationToken = default);
    Task<bool> IsScannerForEventAsync(Guid scannerUserId, Guid eventId, CancellationToken cancellationToken = default);
    Task<EventScanner?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteAsync(EventScanner eventScanner, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}