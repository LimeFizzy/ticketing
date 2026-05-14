using Ticketing.Domain.Entities;

namespace Ticketing.Application.Interfaces;

public interface IPromoCodeRepository
{
    Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PromoCode?> GetByCodeAsync(string code, Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PromoCode>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<PromoCode> CreateAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> IncrementUsageAsync(Guid promoCodeId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}