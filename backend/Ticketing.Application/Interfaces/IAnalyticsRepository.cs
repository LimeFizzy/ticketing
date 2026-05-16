using Ticketing.Application.DTOs;

namespace Ticketing.Application.Interfaces;

public interface IAnalyticsRepository
{
    Task<OrganizerAnalyticsSummaryDto> GetOrganizerSummaryAsync(Guid organizerId);
    Task<EventAnalyticsDto?> GetEventAnalyticsAsync(Guid eventId, Guid organizerId);
    Task<IEnumerable<EventAnalyticsDto>> GetAllEventAnalyticsAsync(Guid organizerId);
    Task<byte[]> ExportAttendeesCsvAsync(Guid eventId, Guid organizerId);
}
