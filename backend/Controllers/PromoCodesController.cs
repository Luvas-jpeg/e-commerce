using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromoCodesController : ControllerBase
    {
        private static readonly HashSet<string> AllowedDiscountTypes = new()
        {
            "percentage",
            "fixed"
        };

        private readonly AppDbContext _context;

        public PromoCodesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var promoCodes = await _context.PromoCodes
                .OrderBy(p => p.Code)
                .Select(p => ToResponse(p))
                .ToListAsync();

            return Ok(promoCodes);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id);

            if (promoCode == null)
                return NotFound(new { message = "Código promocional não encontrado." });

            return Ok(ToResponse(promoCode));
        }

        [HttpGet("validate")]
        public async Task<IActionResult> Validate([FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Código promocional é obrigatório." });

            var promoCode = await FindByCode(code);

            if (promoCode == null || !IsValidForUse(promoCode))
                return NotFound(new { message = "Código inválido, expirado ou já utilizado." });

            return Ok(ToResponse(promoCode));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] PromoCodeRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var normalizedCode = NormalizeCode(request.Code);
            if (await _context.PromoCodes.AnyAsync(p => p.Code == normalizedCode))
                return Conflict(new { message = "Código promocional já cadastrado." });

            var promoCode = new PromoCode();
            ApplyRequest(promoCode, request);

            _context.PromoCodes.Add(promoCode);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = promoCode.Id }, ToResponse(promoCode));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] PromoCodeRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id);
            if (promoCode == null)
                return NotFound(new { message = "Código promocional não encontrado." });

            var normalizedCode = NormalizeCode(request.Code);
            var duplicated = await _context.PromoCodes
                .AnyAsync(p => p.Id != id && p.Code == normalizedCode);
            if (duplicated)
                return Conflict(new { message = "Código promocional já cadastrado." });

            ApplyRequest(promoCode, request);
            await _context.SaveChangesAsync();

            return Ok(ToResponse(promoCode));
        }

        [HttpPost("{id}/use")]
        [Authorize]
        public async Task<IActionResult> Use(int id)
        {
            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id);
            if (promoCode == null)
                return NotFound(new { message = "Código promocional não encontrado." });

            if (!IsValidForUse(promoCode))
                return BadRequest(new { message = "Código inválido, expirado ou já utilizado." });

            promoCode.UsageCount += 1;
            await _context.SaveChangesAsync();

            return Ok(ToResponse(promoCode));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id);
            if (promoCode == null)
                return NotFound(new { message = "Código promocional não encontrado." });

            _context.PromoCodes.Remove(promoCode);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<PromoCode?> FindByCode(string code)
        {
            var normalizedCode = NormalizeCode(code);
            return _context.PromoCodes.FirstOrDefaultAsync(p => p.Code == normalizedCode);
        }

        private static PromoCodeDTO ToResponse(PromoCode promoCode)
        {
            return new PromoCodeDTO
            {
                Id = promoCode.Id,
                Code = promoCode.Code,
                Discount = promoCode.Discount,
                DiscountType = promoCode.DiscountType,
                StartDate = promoCode.StartDate,
                EndDate = promoCode.EndDate,
                IsActive = promoCode.IsActive,
                UsageLimit = promoCode.UsageLimit,
                UsageCount = promoCode.UsageCount
            };
        }

        private static void ApplyRequest(PromoCode promoCode, PromoCodeRequestDTO request)
        {
            promoCode.Code = NormalizeCode(request.Code);
            promoCode.Discount = request.Discount;
            promoCode.DiscountType = request.DiscountType.Trim();
            promoCode.StartDate = request.StartDate.Trim();
            promoCode.EndDate = request.EndDate.Trim();
            promoCode.IsActive = request.IsActive;
            promoCode.UsageLimit = request.UsageLimit;
            promoCode.UsageCount = request.UsageCount;
        }

        private static string? ValidateRequest(PromoCodeRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return "Código promocional é obrigatório.";

            if (request.Discount <= 0)
                return "Desconto deve ser maior que zero.";

            if (!AllowedDiscountTypes.Contains(request.DiscountType))
                return "DiscountType deve ser 'percentage' ou 'fixed'.";

            if (request.DiscountType == "percentage" && request.Discount > 100)
                return "Desconto percentual não pode ser maior que 100.";

            if (string.IsNullOrWhiteSpace(request.StartDate) || string.IsNullOrWhiteSpace(request.EndDate))
                return "Datas de início e término são obrigatórias.";

            if (!DateOnly.TryParse(request.StartDate, out var startDate) ||
                !DateOnly.TryParse(request.EndDate, out var endDate))
                return "Datas devem estar em formato válido.";

            if (endDate < startDate)
                return "Data de término não pode ser anterior à data de início.";

            if (request.UsageLimit.HasValue && request.UsageLimit.Value < 0)
                return "Limite de uso não pode ser negativo.";

            if (request.UsageCount < 0)
                return "Quantidade de usos não pode ser negativa.";

            return null;
        }

        private static bool IsValidForUse(PromoCode promoCode)
        {
            if (!promoCode.IsActive)
                return false;

            if (promoCode.UsageLimit.HasValue && promoCode.UsageCount >= promoCode.UsageLimit.Value)
                return false;

            if (!DateOnly.TryParse(promoCode.StartDate, out var startDate) ||
                !DateOnly.TryParse(promoCode.EndDate, out var endDate))
                return false;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            return today >= startDate && today <= endDate;
        }

        private static string NormalizeCode(string code)
        {
            return code.Trim().ToUpperInvariant();
        }
    }
}
