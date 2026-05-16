namespace Ticketing.Domain.Entities;

public class EmailLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string RecipientEmail { get; set; }
    public required string Subject { get; set; }
    public required string EmailType { get; set; }
    public Guid? EventId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? TicketId { get; set; }
    public required string Status { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
