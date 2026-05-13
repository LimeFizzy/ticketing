namespace Ticketing.Domain.Entities;

public class VenueMap
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required int Width { get; set; }
    public required int Height { get; set; }
    public Guid CreatedBy { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public ICollection<VenueMapPlace> Places { get; set; } = [];
    public ICollection<VenueMapDecoration> Decorations { get; set; } = [];
}
