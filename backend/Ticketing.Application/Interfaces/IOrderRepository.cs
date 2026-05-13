using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateAsync(Order order);
    Task SaveChangesAsync();
}
