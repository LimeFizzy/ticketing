namespace Ticketing.Domain.Entities;

public class EventTicketType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;
}
