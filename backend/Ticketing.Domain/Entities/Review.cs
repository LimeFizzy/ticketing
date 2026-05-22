using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ticketing.Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required Guid EventId { get; set; }
    public required Guid UserId { get; set; }
    public required int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [Timestamp]
    public uint RowVersion { get; set; }

    public Event Event { get; set; } = null!;
    public User User { get; set; } = null!;
}
