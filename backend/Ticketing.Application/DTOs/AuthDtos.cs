using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record LoginRequest(
    [Required] string Email,
    [Required] string Password
);
public record RegisterRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email,
    [Required] string Password
);
public record UserDto(
    [property: Required] Guid Id,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    [property: Required] string Role
);

public record UpdateProfileRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email
);

public record InviteOrganizerRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email
);

public record VerifyInviteResponse(
    [property: Required] bool Valid,
    string? Email
);

public record AcceptInviteRequest(
    [Required] string Token,
    [Required] string Password
);

public record OrganizerDto(
    [property: Required] Guid Id,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    [property: Required] bool IsActive
);
