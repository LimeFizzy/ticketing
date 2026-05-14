using Ticketing.Application.DTOs;

namespace Ticketing.Application.Interfaces;

public interface IAnalyticsRepository
{
    Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default);
}