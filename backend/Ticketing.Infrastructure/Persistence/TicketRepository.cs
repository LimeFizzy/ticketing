using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class TicketRepository(TicketingDbContext context) : ITicketRepository
{
    public async Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.VenueMapPlace)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Ticket?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.VenueMapPlace)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Ticket?> GetByCodeWithEventAsync(string ticketCode, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(ticketCode);
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.User)
            .Include(t => t.VenueMapPlace)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TicketCode == ticketCode, cancellationToken);
    }

    public async Task<Ticket?> GetByCodeForCheckInAsync(string ticketCode, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(ticketCode);
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.Order)
                .ThenInclude(o => o.Event)
            .Include(t => t.VenueMapPlace)
            .FirstOrDefaultAsync(t => t.TicketCode == ticketCode, cancellationToken);
    }

    public Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return context.Tickets.AsNoTracking().AnyAsync(t => t.TicketCode == code, cancellationToken);
    }

    public async Task<IEnumerable<Ticket>> GetByUserAndEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .Include(t => t.EventTicketType)
            .Include(t => t.VenueMapPlace)
            .Where(t => t.UserId == userId && t.Order.EventId == eventId && t.Status == TicketStatus.Active)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasTicketForEventAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.Tickets
            .AsNoTracking()
            .AnyAsync(t => t.UserId == userId && t.Order.EventId == eventId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}