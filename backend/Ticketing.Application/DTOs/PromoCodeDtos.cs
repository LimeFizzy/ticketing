using System.ComponentModel.DataAnnotations;
using Ticketing.Domain.Constants;

namespace Ticketing.Application.DTOs;

public record PromoCodeDto(
    [property: Required] Guid Id,
    [property: Required] string Code,
    [property: Required] DiscountType DiscountType,
    [property: Required] decimal DiscountValue,
    int? MaxUses,
    [property: Required] int CurrentUses,
    DateTime? ExpiresAt,
    [property: Required] bool IsActive,
    [property: Required] DateTime CreatedAt,
    [property: Required] string RowVersion
);

public record CreatePromoCodeRequest(
    [Required][MaxLength(50)] string Code,
    [Required] DiscountType DiscountType,
    [Required][Range(0.01, double.MaxValue)] decimal DiscountValue,
    int? MaxUses,
    DateTime? ExpiresAt
);

public record ValidatePromoCodeRequest(
    [Required][MaxLength(50)] string Code,
    [Required] Guid EventId
);

public record ValidatePromoCodeResponse(
    [property: Required] bool Valid,
    string? ErrorMessage,
    DiscountType? DiscountType,
    decimal? DiscountValue,
    Guid? PromoCodeId
);
