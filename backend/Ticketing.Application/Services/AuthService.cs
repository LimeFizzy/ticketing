using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IAuthService
{
    Task<UserDto?> LoginAsync(LoginRequest request);
    Task<UserDto?> RegisterAsync(RegisterRequest request);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
}

public class AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IAuthService
{
    public async Task<UserDto?> LoginAsync(LoginRequest request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user == null) return null;

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
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

    private static UserDto MapToDto(User user) => new(
        user.Id, user.FirstName, user.LastName, user.Email
    );
}
