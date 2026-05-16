namespace Ticketing.Domain.Entities;

public class VenueMapDecoration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required double X { get; set; }
    public required double Y { get; set; }
    public required double Width { get; set; }
    public required double Height { get; set; }
    public required string Label { get; set; }
    public Guid VenueMapId { get; set; }
    public VenueMap VenueMap { get; set; } = null!;
}
