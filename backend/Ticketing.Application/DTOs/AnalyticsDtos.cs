using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record OrganizerAnalyticsSummaryDto(
    [property: Required] int TotalEvents,
    [property: Required] decimal TotalRevenue,
    [property: Required] int TotalTicketsSold,
    [property: Required] int TotalTicketsCheckedIn,
    [property: Required] double OverallCheckInRate
);

public record EventAnalyticsDto(
    [property: Required] Guid EventId,
    [property: Required] string EventTitle,
    [property: Required] decimal TotalRevenue,
    [property: Required] int TicketsSold,
    [property: Required] int TotalCapacity,
    [property: Required] int TicketsCheckedIn,
    [property: Required] double CheckInRate,
    [property: Required] TicketTypeAnalyticsDto[] ByTicketType,
    [property: Required] DailySalesDto[] DailySales
);

public record TicketTypeAnalyticsDto(
    [property: Required] string TypeName,
    [property: Required] int Sold,
    [property: Required] int Capacity,
    [property: Required] decimal Revenue
);

public record DailySalesDto(
    [property: Required] DateTime Date,
    [property: Required] int TicketsSold,
    [property: Required] decimal Revenue
);
