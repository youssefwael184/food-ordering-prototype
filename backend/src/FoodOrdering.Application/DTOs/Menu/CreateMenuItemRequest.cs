using System.ComponentModel.DataAnnotations;

namespace FoodOrdering.Application.DTOs.Menu;

public class CreateMenuItemRequest
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required, MinLength(2)]
    public string NameEn { get; set; } = string.Empty;

    [Required, MinLength(2)]
    public string NameAr { get; set; } = string.Empty;

    [Required, MinLength(5)]
    public string DescriptionEn { get; set; } = string.Empty;

    [Required, MinLength(5)]
    public string DescriptionAr { get; set; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal Price { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; } = 0;
}
