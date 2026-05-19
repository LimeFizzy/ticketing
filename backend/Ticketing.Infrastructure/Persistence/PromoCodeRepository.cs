using Microsoft.EntityFrameworkCore;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Infrastructure.Persistence;

public class PromoCodeRepository(TicketingDbContext context) : IPromoCodeRepository
{
    public async Task<PromoCode?> GetByIdAsync(Guid id)
    {
        return await context.PromoCodes.FindAsync(id);
    }

    public async Task<PromoCode?> GetByCodeAsync(string code, Guid eventId)
    {
        return await context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == code && p.EventId == eventId);
    }

    public async Task<IEnumerable<PromoCode>> GetByEventIdAsync(Guid eventId)
    {
        return await context.PromoCodes
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PromoCode> CreateAsync(PromoCode promoCode)
    {
        await context.PromoCodes.AddAsync(promoCode);
        return promoCode;
    }

    public Task UpdateAsync(PromoCode promoCode)
    {
        context.PromoCodes.Update(promoCode);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var promoCode = await context.PromoCodes.FindAsync(id);
        if (promoCode != null)
        {
            context.PromoCodes.Remove(promoCode);
        }
    }

    public async Task<bool> IncrementUsageAsync(Guid promoCodeId)
    {
        var affected = await context.Database.ExecuteSqlRawAsync(
            """UPDATE "PromoCodes" SET "CurrentUses" = "CurrentUses" + 1 WHERE "Id" = {0} AND ("MaxUses" IS NULL OR "CurrentUses" < "MaxUses")""",
            promoCodeId);
        return affected > 0;
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }
}
