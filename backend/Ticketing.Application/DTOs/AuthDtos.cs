using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record LoginRequest(
    [Required][EmailAddress][MaxLength(256)] string Email,
    [Required][MinLength(1)][MaxLength(128)] string Password
);

public record RegisterRequest(
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Required][EmailAddress][MaxLength(256)] string Email,
    [Required][MinLength(8)][MaxLength(128)][RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain uppercase, lowercase, and a digit")]
    string Password
);

public record UserDto(
    [property: Required] Guid Id,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    [property: Required] UserRole Role,
    [property: Required] string RowVersion
);

public record UpdateProfileRequest(
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Required][EmailAddress][MaxLength(256)] string Email,
    [Required] string RowVersion
);

public record InviteOrganizerRequest(
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Required][EmailAddress][MaxLength(256)] string Email
);

public record VerifyInviteResponse(
    [property: Required] bool Valid
);

public record AcceptInviteRequest(
    [Required][MaxLength(256)] string Token,
    [Required][MinLength(8)][MaxLength(128)][RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain uppercase, lowercase, and a digit")]
    string Password
);

public record VerifyInviteRequest(
    [Required][MaxLength(256)] string Token
);

public record OrganizerDto(
    [property: Required] Guid Id,
    [property: Required] string FirstName,
    [property: Required] string LastName,
    [property: Required] string Email,
    [property: Required] bool IsActive
);
