using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateAsync(Order order);
    Task<Order?> GetByIdAsync(Guid id);
    Task<Order?> GetByStripeSessionIdAsync(string stripeSessionId);
    Task SaveChangesAsync();
    Task ExecuteInTransactionAsync(Func<Task> action);
}
