using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;

namespace Ticketing.Application.Services;

public interface IAnalyticsService
{
    Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId);
    Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId);
    Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId);
    Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId);
}

public class AnalyticsService(IAnalyticsRepository analyticsRepository) : IAnalyticsService
{
    public Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId)
    {
        return analyticsRepository.GetOrganizerSummaryAsync(organizerId);
    }

    public Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId)
    {
        return analyticsRepository.GetEventAnalyticsAsync(eventId, organizerId);
    }

    public Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId)
    {
        return analyticsRepository.GetAllEventAnalyticsAsync(organizerId);
    }

    public Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId)
    {
        return analyticsRepository.ExportAttendeesCsvAsync(eventId, organizerId);
    }
}
