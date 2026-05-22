using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ticketing.Domain.Entities;

public class EventTicketType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public int Capacity { get; set; }
    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    [Timestamp]
    public uint RowVersion { get; set; }
}
