using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IAuthService
{
    Task<UserDto?> LoginAsync(LoginRequest request);
    Task<UserDto?> RegisterAsync(RegisterRequest request);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<(UserDto User, string InviteToken)> InviteOrganizerAsync(Guid adminUserId, InviteOrganizerRequest request);
    Task<VerifyInviteResponse> VerifyInviteAsync(string token);
    Task<UserDto?> AcceptInviteAsync(AcceptInviteRequest request);
    Task<IEnumerable<OrganizerDto>> GetOrganizersAsync();
    Task RemoveOrganizerAsync(Guid organizerId, Guid adminUserId);
    Task<bool> IsAdminAsync(Guid userId);
    Task<bool> HasPasswordAsync(string email);
}

public class AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IAuthService
{
    public async Task<UserDto?> LoginAsync(LoginRequest request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email);

        // Always hash to prevent timing attacks that enumerate emails
        var hashToVerify = user?.PasswordHash ?? "";
        if (user == null || !passwordHasher.Verify(request.Password, hashToVerify))
            return null;

        return MapToDto(user);
    }

    public async Task<UserDto?> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) return null;

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = passwordHasher.Hash(request.Password)
        };

        await userRepository.AddAsync(user);
        await userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        if (user.Email != request.Email)
        {
            var existingUser = await userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null) return null;
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;

        await userRepository.UpdateAsync(user);
        await userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<(UserDto User, string InviteToken)> InviteOrganizerAsync(Guid adminUserId, InviteOrganizerRequest request)
    {
        var admin = await userRepository.GetByIdAsync(adminUserId);
        if (admin?.Role != UserRole.Admin)
            throw new UnauthorizedAccessException("Only admins can invite organizers");

        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists");

        var inviteToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = "",
            Role = UserRole.Organizer,
            InviteToken = inviteToken,
            InviteTokenExpires = DateTime.UtcNow.AddDays(7)
        };

        await userRepository.AddAsync(user);
        await userRepository.SaveChangesAsync();

        return (MapToDto(user), inviteToken);
    }

    public async Task<VerifyInviteResponse> VerifyInviteAsync(string token)
    {
        var user = await userRepository.GetByInviteTokenAsync(token);
        if (user == null)
            return new VerifyInviteResponse(false, null);

        return new VerifyInviteResponse(true, user.Email);
    }

    public async Task<UserDto?> AcceptInviteAsync(AcceptInviteRequest request)
    {
        var user = await userRepository.GetByInviteTokenAsync(request.Token);
        if (user == null) return null;

        if (user.InviteTokenExpires.HasValue && user.InviteTokenExpires < DateTime.UtcNow)
            return null;

        user.PasswordHash = passwordHasher.Hash(request.Password);
        user.InviteToken = null;
        user.InviteTokenExpires = null;

        await userRepository.UpdateAsync(user);
        await userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<IEnumerable<OrganizerDto>> GetOrganizersAsync()
    {
        var organizers = await userRepository.GetByRoleAsync(UserRole.Organizer);
        return organizers.Select(o => new OrganizerDto(
            o.Id, o.FirstName, o.LastName, o.Email,
            !string.IsNullOrEmpty(o.PasswordHash)
        ));
    }

    public async Task RemoveOrganizerAsync(Guid organizerId, Guid adminUserId)
    {
        var admin = await userRepository.GetByIdAsync(adminUserId);
        if (admin?.Role != UserRole.Admin)
            throw new UnauthorizedAccessException("Only admins can remove organizers");

        var organizer = await userRepository.GetByIdAsync(organizerId);
        if (organizer == null || organizer.Role != UserRole.Organizer)
            throw new InvalidOperationException("Organizer not found");

        await userRepository.DeleteAsync(organizer);
        await userRepository.SaveChangesAsync();
    }

    public async Task<bool> IsAdminAsync(Guid userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        return user?.Role == UserRole.Admin;
    }

    public async Task<bool> HasPasswordAsync(string email)
    {
        var user = await userRepository.GetByEmailAsync(email);
        return user != null && !string.IsNullOrEmpty(user.PasswordHash);
    }

    private static UserDto MapToDto(User user) => new(
        user.Id, user.FirstName, user.LastName, user.Email, user.Role
    );
}
