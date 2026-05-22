using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ticketing.Domain.Constants;

namespace Ticketing.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string TicketCode { get; set; }
    public required Guid EventTicketTypeId { get; set; }
    public Guid OrderId { get; set; }
    public required decimal PricePaid { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Active;
    public DateTime? CheckedInAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public Guid? VenueMapPlaceId { get; set; }
    public User User { get; set; } = null!;
    public EventTicketType EventTicketType { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public VenueMapPlace? VenueMapPlace { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];
}
