using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record LoginRequest(
    [property: Required] string Email,
    [property: Required] string Password
);
public record RegisterRequest(
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    [property: Required] string Password
);
public record UserDto(
    [property: Required] Guid Id,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email
);