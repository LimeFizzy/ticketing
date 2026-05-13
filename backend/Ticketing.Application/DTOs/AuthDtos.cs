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
    [property: Required] string Email
);

public record UpdateProfileRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email
);
