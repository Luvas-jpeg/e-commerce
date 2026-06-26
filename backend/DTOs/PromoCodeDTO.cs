namespace EquipamentosMedicosApi.DTOs
{
    public class PromoCodeDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal Discount { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; }
    }

    public class PromoCodeRequestDTO
    {
        public string Code { get; set; } = string.Empty;
        public decimal Discount { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; }
    }
}
