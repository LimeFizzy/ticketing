using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Ticketing.Domain.Constants;
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
        modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
        modelBuilder.Entity<Event>().Property(e => e.Status).HasConversion<string>();
        modelBuilder.Entity<Order>().Property(o => o.Status).HasConversion<string>();
        modelBuilder.Entity<Ticket>().Property(t => t.Status).HasConversion<string>();
        modelBuilder.Entity<PromoCode>().Property(p => p.DiscountType).HasConversion<string>();

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

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.Title);

        modelBuilder.Entity<EventTicketType>()
            .HasIndex(et => new { et.EventId, et.Name });

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => new { o.EventId, o.CreatedAt });

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.StripeSessionId);

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

        modelBuilder.Entity<EmailLog>()
            .HasIndex(e => e.RecipientEmail);

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
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.EventId);

        modelBuilder.Entity<Review>().ToTable(t =>
            t.HasCheckConstraint("CK_Review_Rating", "\"Rating\" BETWEEN 1 AND 5"));

        modelBuilder.Entity<EventTicketType>().ToTable(t =>
        {
            t.HasCheckConstraint("CK_EventTicketType_Price", "\"Price\" >= 0");
            t.HasCheckConstraint("CK_EventTicketType_Capacity", "\"Capacity\" > 0");
        });

        modelBuilder.Entity<PromoCode>().ToTable(t =>
            t.HasCheckConstraint("CK_PromoCode_DiscountValue", "\"DiscountValue\" > 0"));

        modelBuilder.Entity<User>().Property(u => u.Email).HasMaxLength(256);
        modelBuilder.Entity<User>().Property(u => u.FirstName).HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.LastName).HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.InviteToken).HasMaxLength(128);

        modelBuilder.Entity<Event>().Property(e => e.Title).HasMaxLength(200);
        modelBuilder.Entity<Event>().Property(e => e.Venue).HasMaxLength(200);
        modelBuilder.Entity<Event>().Property(e => e.City).HasMaxLength(100);
        modelBuilder.Entity<Event>().Property(e => e.ImageUrl).HasMaxLength(500);
        modelBuilder.Entity<Event>().Property(e => e.Description).HasMaxLength(2000);
        modelBuilder.Entity<Event>().Property(e => e.Disclaimers).HasMaxLength(2000);
        modelBuilder.Entity<Event>().Property(e => e.TimeZone).HasMaxLength(100);

        modelBuilder.Entity<EventTicketType>().Property(t => t.Name).HasMaxLength(100);
        modelBuilder.Entity<EventTicketType>().Property(t => t.Description).HasMaxLength(500);

        modelBuilder.Entity<Ticket>().Property(t => t.TicketCode).HasMaxLength(50);

        modelBuilder.Entity<PromoCode>().Property(p => p.Code).HasMaxLength(50);

        modelBuilder.Entity<Review>().Property(r => r.Comment).HasMaxLength(2000);

        modelBuilder.Entity<VenueMap>().Property(v => v.Name).HasMaxLength(200);
        modelBuilder.Entity<VenueMapPlace>().Property(p => p.Label).HasMaxLength(100);
        modelBuilder.Entity<VenueMapDecoration>().Property(d => d.Label).HasMaxLength(100);

        modelBuilder.Entity<EmailLog>().Property(e => e.RecipientEmail).HasMaxLength(256);
        modelBuilder.Entity<EmailLog>().Property(e => e.Subject).HasMaxLength(500);
        modelBuilder.Entity<EmailLog>().Property(e => e.EmailType).HasMaxLength(50);
        modelBuilder.Entity<EmailLog>().Property(e => e.Status).HasMaxLength(20);

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.City);

        modelBuilder.Entity<VenueMap>()
            .HasOne(vm => vm.CreatedByUser)
            .WithMany()
            .HasForeignKey(vm => vm.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VenueMap>()
            .HasIndex(vm => vm.CreatedBy);

        modelBuilder.Entity<VenueMapPlace>()
            .HasOne(p => p.VenueMap)
            .WithMany(vm => vm.Places)
            .HasForeignKey(p => p.VenueMapId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VenueMapDecoration>()
            .HasOne(d => d.VenueMap)
            .WithMany(vm => vm.Decorations)
            .HasForeignKey(d => d.VenueMapId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Event>()
            .HasOne(e => e.VenueMap)
            .WithMany()
            .HasForeignKey(e => e.VenueMapId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.VenueMapPlace)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.VenueMapPlaceId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.VenueMapPlaceId);

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
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => new { es.ScannerUserId, es.EventId })
            .IsUnique();

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => es.OrganizerId);

        modelBuilder.Entity<EventScanner>()
            .HasIndex(es => es.ScannerUserId);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.OrderId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.Status);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.CreatedAt);

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.CreatedAt);
    }
}
