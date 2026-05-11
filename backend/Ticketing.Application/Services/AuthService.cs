using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IAuthService
{
    Task<UserDto?> LoginAsync(LoginRequest request);
    Task<UserDto?> RegisterAsync(RegisterRequest request);
}

public class AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IAuthService
{
    public async Task<UserDto?> LoginAsync(LoginRequest request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user == null) return null;

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            return null;

        return new UserDto(user.Id, user.FirstName, user.LastName, user.Email);
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

        return new UserDto(user.Id, user.FirstName, user.LastName, user.Email);
    }
}