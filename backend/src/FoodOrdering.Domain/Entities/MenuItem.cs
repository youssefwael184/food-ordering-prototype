using FoodOrdering.Domain.Common;

namespace FoodOrdering.Domain.Entities;

public class MenuItem : EntityBase
{
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }
}
