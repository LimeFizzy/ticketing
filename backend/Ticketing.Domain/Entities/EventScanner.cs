namespace Ticketing.Domain.Entities;

public class EventScanner
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? EventId { get; set; }
    public Guid OrganizerId { get; set; }
    public Guid ScannerUserId { get; set; }
    public bool AssignToAllEvents { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Event? Event { get; set; }
    public User Organizer { get; set; } = null!;
    public User ScannerUser { get; set; } = null!;
}
