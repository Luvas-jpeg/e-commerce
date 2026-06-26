using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Services;

public class PromoCodeService
{
    private readonly AppDbContext _context;

    public PromoCodeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<decimal>> ApplyDiscountAsync(string? code, decimal subtotal)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return ServiceResult<decimal>.Ok(0m);
        }

        var normalizedCode = code.Trim().ToUpper();

        var promoCode = await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == normalizedCode);

        if (promoCode == null || !IsValidPromoCode(promoCode))
        {
            return ServiceResult<decimal>.Fail("Codigo promocional invalido.");
        }

        var discount = promoCode.DiscountType == "percentage"
            ? subtotal * (promoCode.Discount / 100)
            : promoCode.Discount;

        discount = Math.Min(discount, subtotal);

        promoCode.UsageCount += 1;

        return ServiceResult<decimal>.Ok(discount);
    }

    private static bool IsValidPromoCode(PromoCode promoCode)
    {
        if (!promoCode.IsActive)
        {
            return false;
        }

        if (promoCode.UsageLimit.HasValue && promoCode.UsageCount >= promoCode.UsageLimit.Value)
        {
            return false;
        }

        if (!DateOnly.TryParse(promoCode.StartDate, out var startDate) ||
            !DateOnly.TryParse(promoCode.EndDate, out var endDate))
        {
            return false;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return today >= startDate && today <= endDate;
    }
}