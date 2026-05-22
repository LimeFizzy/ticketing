using System.Text;
using Ticketing.Application.Interfaces;

namespace Ticketing.Infrastructure.Auth;

public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;
    private const int MaxPasswordBytes = 72;

    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        if (Encoding.UTF8.GetByteCount(password) > MaxPasswordBytes)
            throw new ArgumentException($"Password must not exceed {MaxPasswordBytes} bytes", nameof(password));
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string passwordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        if (Encoding.UTF8.GetByteCount(password) > MaxPasswordBytes)
            throw new ArgumentException($"Password must not exceed {MaxPasswordBytes} bytes", nameof(password));
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
