using System.ComponentModel.DataAnnotations;

namespace Ticketing.Application.DTOs;

public record PromoCodeDto(
    [property: Required] Guid Id,
    [property: Required] string Code,
    [property: Required] string DiscountType,
    [property: Required] decimal DiscountValue,
    int? MaxUses,
    [property: Required] int CurrentUses,
    DateTime? ExpiresAt,
    [property: Required] bool IsActive,
    [property: Required] DateTime CreatedAt
);

public record CreatePromoCodeRequest(
    [Required] string Code,
    [Required] string DiscountType,
    [Required] decimal DiscountValue,
    int? MaxUses,
    DateTime? ExpiresAt
);

public record ValidatePromoCodeRequest(
    [Required] string Code,
    [Required] Guid EventId
);

public record ValidatePromoCodeResponse(
    [property: Required] bool Valid,
    string? ErrorMessage,
    string? DiscountType,
    decimal? DiscountValue,
    Guid? PromoCodeId
);
