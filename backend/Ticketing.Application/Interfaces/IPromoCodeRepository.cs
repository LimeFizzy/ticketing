using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IPromoCodeRepository
{
    Task<PromoCode?> GetByIdAsync(Guid id);
    Task<PromoCode?> GetByCodeAsync(string code, Guid eventId);
    Task<IEnumerable<PromoCode>> GetByEventIdAsync(Guid eventId);
    Task<PromoCode> CreateAsync(PromoCode promoCode);
    Task UpdateAsync(PromoCode promoCode);
    Task DeleteAsync(Guid id);
    Task<bool> IncrementUsageAsync(Guid promoCodeId);
    Task SaveChangesAsync();
}
