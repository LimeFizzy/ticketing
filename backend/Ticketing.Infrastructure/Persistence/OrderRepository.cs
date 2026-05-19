using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class OrderRepository(TicketingDbContext context) : IOrderRepository
{
    public async Task<Order> CreateAsync(Order order)
    {
        await context.Orders.AddAsync(order);
        return order;
    }

    public Task<Order?> GetByIdAsync(Guid id)
    {
        return context.Orders
            .Include(o => o.User)
            .Include(o => o.Event)
            .Include(o => o.Tickets)
                .ThenInclude(t => t.EventTicketType)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public Task<Order?> GetByStripeSessionIdAsync(string stripeSessionId)
    {
        return context.Orders.FirstOrDefaultAsync(o => o.StripeSessionId == stripeSessionId);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }

    public async Task ExecuteInTransactionAsync(Func<Task> action)
    {
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            await action();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
