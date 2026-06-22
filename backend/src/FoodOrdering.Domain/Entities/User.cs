using FoodOrdering.Domain.Common;
using FoodOrdering.Domain.Enums;

namespace FoodOrdering.Domain.Entities;

public class User : EntityBase
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "en";
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsActive { get; set; } = true;
}
