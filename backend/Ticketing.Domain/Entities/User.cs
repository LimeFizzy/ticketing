namespace Ticketing.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = "attendee";
    public string? InviteToken { get; set; }
    public DateTime? InviteTokenExpires { get; set; }

    public ICollection<Ticket> Tickets { get; set; } = [];
}
