using Microsoft.EntityFrameworkCore;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class TicketingDbContext(DbContextOptions<TicketingDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventTicketType> EventTicketTypes => Set<EventTicketType>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.InviteToken);

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Organizer)
            .WithMany()
            .HasForeignKey(e => e.OrganizerId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.Category);

        modelBuilder.Entity<Event>()
            .HasIndex(e => new { e.Date, e.Featured });

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.OrganizerId);

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.Status);

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.IsDeleted);

        modelBuilder.Entity<EventTicketType>()
            .HasIndex(et => new { et.EventId, et.Name });

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => new { o.EventId, o.CreatedAt });

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.UserId);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.TicketCode)
            .IsUnique();

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.EventTicketTypeId, t.Status });

        modelBuilder.Entity<EmailLog>()
            .HasIndex(e => new { e.EventId, e.EmailType });

        modelBuilder.Entity<EmailLog>()
            .HasIndex(e => new { e.OrderId, e.EmailType });

        modelBuilder.Entity<EmailLog>()
            .HasIndex(e => e.CreatedAt);

        modelBuilder.Entity<PromoCode>()
            .HasIndex(p => new { p.Code, p.EventId })
            .IsUnique();

        modelBuilder.Entity<PromoCode>()
            .HasOne(p => p.Event)
            .WithMany(e => e.PromoCodes)
            .HasForeignKey(p => p.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PromoCode>()
            .HasIndex(p => p.EventId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.PromoCode)
            .WithMany()
            .HasForeignKey(o => o.PromoCodeId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.EventId, r.UserId })
            .IsUnique();

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Reviews)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.EventId);
    }
}
