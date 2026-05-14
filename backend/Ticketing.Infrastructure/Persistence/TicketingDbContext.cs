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
    public DbSet<VenueMap> VenueMaps => Set<VenueMap>();
    public DbSet<VenueMapPlace> VenueMapPlaces => Set<VenueMapPlace>();
    public DbSet<VenueMapDecoration> VenueMapDecorations => Set<VenueMapDecoration>();
    public DbSet<EventVenueMapPlace> EventVenueMapPlaces => Set<EventVenueMapPlace>();
    public DbSet<EventScanner> EventScanners => Set<EventScanner>();

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

        // VenueMap
        modelBuilder.Entity<VenueMap>()
            .HasOne(vm => vm.CreatedByUser)
            .WithMany()
            .HasForeignKey(vm => vm.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VenueMap>()
            .HasIndex(vm => vm.CreatedBy);

        // VenueMapPlace
        modelBuilder.Entity<VenueMapPlace>()
            .HasOne(p => p.VenueMap)
            .WithMany(vm => vm.Places)
            .HasForeignKey(p => p.VenueMapId)
            .OnDelete(DeleteBehavior.Cascade);

        // VenueMapDecoration
        modelBuilder.Entity<VenueMapDecoration>()
            .HasOne(d => d.VenueMap)
            .WithMany(vm => vm.Decorations)
            .HasForeignKey(d => d.VenueMapId)
            .OnDelete(DeleteBehavior.Cascade);

        // Event -> VenueMap
        modelBuilder.Entity<Event>()
            .HasOne(e => e.VenueMap)
            .WithMany()
            .HasForeignKey(e => e.VenueMapId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Ticket -> VenueMapPlace
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.VenueMapPlace)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.VenueMapPlaceId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.VenueMapPlaceId);

        // EventVenueMapPlace
        modelBuilder.Entity<EventVenueMapPlace>()
            .HasOne(evmp => evmp.Event)
            .WithMany()
            .HasForeignKey(evmp => evmp.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventVenueMapPlace>()
            .HasOne(evmp => evmp.VenueMapPlace)
            .WithMany()
            .HasForeignKey(evmp => evmp.VenueMapPlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventVenueMapPlace>()
            .HasOne(evmp => evmp.EventTicketType)
            .WithMany()
            .HasForeignKey(evmp => evmp.EventTicketTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventVenueMapPlace>()
            .HasIndex(evmp => new { evmp.EventId, evmp.VenueMapPlaceId })
            .IsUnique();

        // EventScanner
        modelBuilder.Entity<EventScanner>()
            .HasOne(es => es.Event)
            .WithMany()
            .HasForeignKey(es => es.EventId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        modelBuilder.Entity<EventScanner>()
            .HasOne(es => es.Organizer)
            .WithMany()
            .HasForeignKey(es => es.OrganizerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventScanner>()
            .HasOne(es => es.ScannerUser)
            .WithMany()
            .HasForeignKey(es => es.ScannerUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => new { es.ScannerUserId, es.EventId })
            .IsUnique();

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => es.OrganizerId);

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => es.ScannerUserId);
    }
}
