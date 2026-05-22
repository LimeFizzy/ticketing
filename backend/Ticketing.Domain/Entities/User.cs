using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ticketing.Domain.Constants;

namespace Ticketing.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Attendee;
    public string? InviteToken { get; set; }
    public DateTime? InviteTokenExpires { get; set; }

    [Timestamp]
    public uint RowVersion { get; set; }

    public ICollection<Ticket> Tickets { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
