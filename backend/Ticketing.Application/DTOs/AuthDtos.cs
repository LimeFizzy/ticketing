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
    [Required] Guid Id, 
    [Required] string FirstName, 
    [Required] string LastName, 
    [Required] string Email
);