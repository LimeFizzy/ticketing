namespace Ticketing.Application.DTOs;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string FirstName, string LastName, string Email, string Password);
public record UserDto(Guid Id, string FirstName, string LastName, string Email);