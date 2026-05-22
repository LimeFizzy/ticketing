using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class OrderRepository(TicketingDbContext context) : IOrderRepository
{
    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        await context.Orders.AddAsync(order, cancellationToken);
        return order;
    }

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Event)
            .Include(o => o.Tickets)
                .ThenInclude(t => t.EventTicketType)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public Task<Order?> GetByStripeSessionIdAsync(string stripeSessionId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(stripeSessionId);
        return context.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.StripeSessionId == stripeSessionId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await action(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}