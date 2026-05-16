namespace Ticketing.Domain.Entities;

public class EventVenueMapPlace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Guid VenueMapPlaceId { get; set; }
    public Guid EventTicketTypeId { get; set; }

    public Event Event { get; set; } = null!;
    public VenueMapPlace VenueMapPlace { get; set; } = null!;
    public EventTicketType EventTicketType { get; set; } = null!;
}
