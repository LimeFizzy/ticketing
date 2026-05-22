using System.Security.Cryptography;
using System.Text;
using Ticketing.Application.DTOs;
using Ticketing.Application.Helpers;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IAuthService
{
    Task<UserDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserDto?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<(UserDto User, string InviteToken)> InviteOrganizerAsync(Guid adminUserId, InviteOrganizerRequest request, CancellationToken cancellationToken = default);
    Task<VerifyInviteResponse> VerifyInviteAsync(string token, CancellationToken cancellationToken = default);
    Task<UserDto?> AcceptInviteAsync(AcceptInviteRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrganizerDto>> GetOrganizersAsync(CancellationToken cancellationToken = default);
    Task RemoveOrganizerAsync(Guid organizerId, Guid adminUserId, CancellationToken cancellationToken = default);
    Task<bool> IsAdminAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IAuthService
{
    // Pre-computed bcrypt hash for timing-safe login when user is not found.
    // PasswordHasher.Verify rejects empty strings, so we bypass it and call BCrypt directly.
    // This hash corresponds to a throwaway password at work factor 12.
    private const string DummyHash = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9rBrZ6E6JXIQ0l3Q0Y1W/4T0Cj.e";

    public async Task<UserDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        var hashToVerify = user?.PasswordHash ?? DummyHash;
        var verified = false;
        try
        {
            verified = passwordHasher.Verify(request.Password, hashToVerify);
        }
        catch (ArgumentException)
        {
            // Hash was empty/invalid (shouldn't happen with DummyHash but be safe)
        }

        if (user == null || !verified)
            return null;

        return MapToDto(user);
    }

    public async Task<UserDto?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingUser != null) return null;

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(request.Password)
        };

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(user);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null) return null;

        var normalizedEmail = request.Email.ToLowerInvariant();
        if (user.Email != normalizedEmail)
        {
            var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
            if (existingUser != null)
                throw new InvalidOperationException("A user with this email already exists");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = normalizedEmail;
        user.RowVersion = RowVersionHelper.FromBase64(request.RowVersion);

        await userRepository.UpdateAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(user);
    }

    public async Task<(UserDto User, string InviteToken)> InviteOrganizerAsync(Guid adminUserId, InviteOrganizerRequest request, CancellationToken cancellationToken = default)
    {
        var admin = await userRepository.GetByIdAsync(adminUserId, cancellationToken);
        if (admin?.Role != UserRole.Admin)
            throw new UnauthorizedAccessException("Only admins can invite organizers");

        var normalizedEmail = request.Email.ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists");

        var rawToken = Guid.NewGuid().ToString("N");
        var hashedToken = HashToken(rawToken);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = normalizedEmail,
            PasswordHash = "",
            Role = UserRole.Organizer,
            InviteToken = hashedToken,
            InviteTokenExpires = DateTime.UtcNow.AddDays(7)
        };

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return (MapToDto(user), rawToken);
    }

    public async Task<VerifyInviteResponse> VerifyInviteAsync(string token, CancellationToken cancellationToken = default)
    {
        var hashedToken = HashToken(token);
        var user = await userRepository.GetByInviteTokenAsync(hashedToken, cancellationToken);
        return new VerifyInviteResponse(user != null, user?.Email ?? null);
    }

    public async Task<UserDto?> AcceptInviteAsync(AcceptInviteRequest request, CancellationToken cancellationToken = default)
    {
        var hashedToken = HashToken(request.Token);
        var user = await userRepository.GetByInviteTokenAsync(hashedToken, cancellationToken);
        if (user == null) return null;

        if (user.InviteTokenExpires.HasValue && user.InviteTokenExpires < DateTime.UtcNow)
            return null;

        user.PasswordHash = passwordHasher.Hash(request.Password);
        user.InviteToken = null;
        user.InviteTokenExpires = null;

        await userRepository.UpdateAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(user);
    }

    public async Task<IEnumerable<OrganizerDto>> GetOrganizersAsync(CancellationToken cancellationToken = default)
    {
        var organizers = await userRepository.GetByRoleAsync(UserRole.Organizer, cancellationToken);
        return organizers.Select(o => new OrganizerDto(
            o.Id, o.FirstName, o.LastName, o.Email,
            !string.IsNullOrEmpty(o.PasswordHash)
        ));
    }

    public async Task RemoveOrganizerAsync(Guid organizerId, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        var admin = await userRepository.GetByIdAsync(adminUserId, cancellationToken);
        if (admin?.Role != UserRole.Admin)
            throw new UnauthorizedAccessException("Only admins can remove organizers");

        var organizer = await userRepository.GetByIdAsync(organizerId, cancellationToken);
        if (organizer == null || organizer.Role != UserRole.Organizer)
            throw new InvalidOperationException("Organizer not found");

        await userRepository.DeleteAsync(organizer, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> IsAdminAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        return user?.Role == UserRole.Admin;
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

    private static UserDto MapToDto(User user) => new(
        user.Id, user.FirstName, user.LastName, user.Email, user.Role,
        RowVersionHelper.ToBase64(user.RowVersion)
    );
}
