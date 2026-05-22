using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Domain.Entities;

public class PromoCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Code { get; set; }
    public required Guid EventId { get; set; }
    public DiscountType DiscountType { get; set; }
    public required decimal DiscountValue { get; set; }
    public int? MaxUses { get; set; }
    public int CurrentUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public Event Event { get; set; } = null!;
}
