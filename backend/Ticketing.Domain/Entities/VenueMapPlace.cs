namespace Ticketing.Domain.Entities;

public class VenueMapPlace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Kind { get; set; }
    public required string Label { get; set; }
    public required double X { get; set; }
    public required double Y { get; set; }
    public double? Width { get; set; }
    public double? Height { get; set; }
    public required int Capacity { get; set; }
    public Guid VenueMapId { get; set; }
    public VenueMap VenueMap { get; set; } = null!;

    public ICollection<Ticket> Tickets { get; set; } = [];
}
