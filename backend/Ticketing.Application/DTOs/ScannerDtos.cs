using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record InviteScannerRequest(
    [Required, EmailAddress] string Email,
    string? FirstName,
    string? LastName,
    Guid? EventId,
    [Required] bool AssignToAllEvents
);

public record ScannerDto(
    [property: Required] Guid Id,
    [property: Required] Guid ScannerUserId,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    Guid? EventId,
    string? EventTitle,
    [property: Required] bool AssignToAllEvents,
    [property: Required] bool IsActive
);

public record ScannerEventDto(
    [property: Required] Guid EventId,
    [property: Required] string EventTitle,
    [property: Required] DateTime EventDate,
    [property: Required] string EventVenue,
    [property: Required] string EventImageUrl
);

public record ScannerStatusDto(
    [property: Required] bool IsScanner
);
