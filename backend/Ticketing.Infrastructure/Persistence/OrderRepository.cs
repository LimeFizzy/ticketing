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

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
