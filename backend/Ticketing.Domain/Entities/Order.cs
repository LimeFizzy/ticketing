namespace Ticketing.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required Guid UserId { get; set; }
    public required Guid EventId { get; set; }
    public required decimal TotalAmount { get; set; }
    public required string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? StripeSessionId { get; set; }

    public User User { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public ICollection<Ticket> Tickets { get; set; } = [];
}
