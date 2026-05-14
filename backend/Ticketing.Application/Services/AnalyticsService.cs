using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;

namespace Ticketing.Application.Services;

public interface IAnalyticsService
{
    Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default);
}

public class AnalyticsService(IAnalyticsRepository analyticsRepository) : IAnalyticsService
{
    public Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        return analyticsRepository.GetOrganizerSummaryAsync(organizerId, cancellationToken);
    }

    public Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        return analyticsRepository.GetEventAnalyticsAsync(eventId, organizerId, cancellationToken);
    }

    public Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        return analyticsRepository.GetAllEventAnalyticsAsync(organizerId, cancellationToken);
    }

    public Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        return analyticsRepository.ExportAttendeesCsvAsync(eventId, organizerId, cancellationToken);
    }
}
