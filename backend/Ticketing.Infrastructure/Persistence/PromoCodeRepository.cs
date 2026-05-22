using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class PromoCodeRepository(TicketingDbContext context) : IPromoCodeRepository
{
    public async Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.PromoCodes.FindAsync([id], cancellationToken);
    }

    public async Task<PromoCode?> GetByCodeAsync(string code, Guid eventId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        var upperCode = code.ToUpperInvariant();
        return await context.PromoCodes
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code == upperCode && p.EventId == eventId, cancellationToken);
    }

    public async Task<IEnumerable<PromoCode>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await context.PromoCodes
            .AsNoTracking()
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<PromoCode> CreateAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        await context.PromoCodes.AddAsync(promoCode, cancellationToken);
        return promoCode;
    }

    public Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        context.PromoCodes.Update(promoCode);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var promoCode = await context.PromoCodes.FindAsync([id], cancellationToken);
        if (promoCode != null)
        {
            context.PromoCodes.Remove(promoCode);
        }
    }

    public async Task<bool> IncrementUsageAsync(Guid promoCodeId, CancellationToken cancellationToken = default)
    {
        var affected = await context.Database.ExecuteSqlRawAsync(
            """UPDATE "PromoCodes" SET "CurrentUses" = "CurrentUses" + 1 WHERE "Id" = {0} AND "IsActive" = true AND ("MaxUses" IS NULL OR "CurrentUses" < "MaxUses") AND ("ExpiresAt" IS NULL OR "ExpiresAt" > NOW())""",
            [promoCodeId], cancellationToken);
        return affected > 0;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}