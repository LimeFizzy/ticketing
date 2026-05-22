using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Domain.Entities;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required EventCategory Category { get; set; }
    public required DateTime Date { get; set; }
    public required string Venue { get; set; }
    public required string City { get; set; }
    public decimal PriceFrom { get; set; }
    public required string ImageUrl { get; set; }
    public required string Description { get; set; }
    public int AvailableTickets { get; set; }
    public bool Featured { get; set; }
    public string? Disclaimers { get; set; }
    public Guid? VenueMapId { get; set; }
    public VenueMap? VenueMap { get; set; }
    public string? TimeZone { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Draft;
    public bool IsDeleted { get; set; }
    public Guid? OrganizerId { get; set; }
    public User? Organizer { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public ICollection<EventTicketType> TicketTypes { get; set; } = [];
    public ICollection<PromoCode> PromoCodes { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
