namespace Ticketing.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }

    public string? CardHolderName { get; set; }
    public string? CardLast4 { get; set; }
    public string? CardExpiry { get; set; }
    public string? CardBrand { get; set; }

    public ICollection<Ticket> Tickets { get; set; } = [];
}