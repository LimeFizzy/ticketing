using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IPromoCodeService
{
    Task<PromoCodeDto> CreateAsync(Guid eventId, Guid organizerId, CreatePromoCodeRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<PromoCodeDto>> GetByEventIdAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid promoCodeId, Guid organizerId, CancellationToken cancellationToken = default);
    Task<ValidatePromoCodeResponse> ValidateAsync(ValidatePromoCodeRequest request, CancellationToken cancellationToken = default);
    decimal CalculateDiscount(PromoCode promoCode, decimal originalTotal);
}

public class PromoCodeService(
    IPromoCodeRepository promoCodeRepository,
    IEventRepository eventRepository) : IPromoCodeService
{
    public async Task<PromoCodeDto> CreateAsync(Guid eventId, Guid organizerId, CreatePromoCodeRequest request, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken)
            ?? throw new KeyNotFoundException("Event not found");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event");

        if (request.DiscountValue <= 0)
            throw new InvalidOperationException("Discount value must be greater than zero");

        if (request.DiscountType == DiscountType.Percentage && request.DiscountValue > 100)
            throw new InvalidOperationException("Percentage discount cannot exceed 100%");

        if (request.MaxUses.HasValue && request.MaxUses.Value <= 0)
            throw new InvalidOperationException("Max uses must be greater than zero if provided");

        if (request.ExpiresAt.HasValue && request.ExpiresAt.Value <= DateTime.UtcNow)
            throw new InvalidOperationException("Expiration date must be in the future");

        var existing = await promoCodeRepository.GetByCodeAsync(request.Code.ToUpperInvariant(), eventId, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("A promo code with this code already exists for this event");

        var promoCode = new PromoCode
        {
            Code = request.Code.ToUpperInvariant(),
            EventId = eventId,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MaxUses = request.MaxUses,
            ExpiresAt = request.ExpiresAt,
            IsActive = true
        };

        var created = await promoCodeRepository.CreateAsync(promoCode, cancellationToken);
        await promoCodeRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(created);
    }

    public async Task<IEnumerable<PromoCodeDto>> GetByEventIdAsync(Guid eventId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken)
            ?? throw new KeyNotFoundException("Event not found");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event");

        var promoCodes = await promoCodeRepository.GetByEventIdAsync(eventId, cancellationToken);
        return promoCodes.Select(MapToDto);
    }

    public async Task DeleteAsync(Guid promoCodeId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        var promoCode = await promoCodeRepository.GetByIdAsync(promoCodeId, cancellationToken)
            ?? throw new KeyNotFoundException("Promo code not found");

        var @event = await eventRepository.GetByIdAsync(promoCode.EventId, cancellationToken)
            ?? throw new KeyNotFoundException("Event not found");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event");

        promoCode.IsActive = false;
        await promoCodeRepository.UpdateAsync(promoCode, cancellationToken);
        await promoCodeRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<ValidatePromoCodeResponse> ValidateAsync(ValidatePromoCodeRequest request, CancellationToken cancellationToken = default)
    {
        var promoCode = await promoCodeRepository.GetByCodeAsync(request.Code.ToUpperInvariant(), request.EventId, cancellationToken);

        if (promoCode == null)
            return new ValidatePromoCodeResponse(false, "Promo code not found", null, null, null);

        if (!promoCode.IsActive)
            return new ValidatePromoCodeResponse(false, "Promo code is no longer active", null, null, null);

        if (promoCode.ExpiresAt.HasValue && promoCode.ExpiresAt.Value < DateTime.UtcNow)
            return new ValidatePromoCodeResponse(false, "Promo code has expired", null, null, null);

        if (promoCode.MaxUses.HasValue && promoCode.CurrentUses >= promoCode.MaxUses.Value)
            return new ValidatePromoCodeResponse(false, "Promo code usage limit reached", null, null, null);

        return new ValidatePromoCodeResponse(true, null, promoCode.DiscountType, promoCode.DiscountValue, promoCode.Id);
    }

    public decimal CalculateDiscount(PromoCode promoCode, decimal originalTotal)
    {
        return promoCode.DiscountType switch
        {
            DiscountType.Percentage => Math.Round(originalTotal * promoCode.DiscountValue / 100, 2),
            DiscountType.FixedAmount => Math.Min(promoCode.DiscountValue, originalTotal),
            _ => 0
        };
    }

    private static PromoCodeDto MapToDto(PromoCode promoCode) => new(
        promoCode.Id,
        promoCode.Code,
        promoCode.DiscountType,
        promoCode.DiscountValue,
        promoCode.MaxUses,
        promoCode.CurrentUses,
        promoCode.ExpiresAt,
        promoCode.IsActive,
        promoCode.CreatedAt,
        promoCode.RowVersion
    );
}
