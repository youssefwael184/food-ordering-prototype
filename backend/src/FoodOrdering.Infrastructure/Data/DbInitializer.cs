using FoodOrdering.Domain.Entities;
using FoodOrdering.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
            return;

        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            FullName = "Admin User",
            Email = "admin@foodapp.com",
            PhoneNumber = "01000000000",
            PreferredLanguage = "en",
            Role = UserRole.Admin,
            IsActive = true
        };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin123!");

        var customer = new User
        {
            FullName = "Demo Customer",
            Email = "customer@foodapp.com",
            PhoneNumber = "01111111111",
            PreferredLanguage = "en",
            Role = UserRole.Customer,
            IsActive = true
        };
        customer.PasswordHash = hasher.HashPassword(customer, "Customer123!");

        var categories = new List<Category>
        {
            new() { NameEn = "Burgers", NameAr = "برجر", Slug = "burgers" },
            new() { NameEn = "Pizza", NameAr = "بيتزا", Slug = "pizza" },
            new() { NameEn = "Drinks", NameAr = "مشروبات", Slug = "drinks" },
            new() { NameEn = "Desserts", NameAr = "حلويات", Slug = "desserts" }
        };

        db.Users.AddRange(admin, customer);
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync(ct);

        var burger = categories[0];
        var pizza = categories[1];
        var drinks = categories[2];
        var desserts = categories[3];

        db.MenuItems.AddRange(
            new MenuItem
            {
                CategoryId = burger.Id,
                NameEn = "Classic Beef Burger",
                NameAr = "برجر لحم كلاسيك",
                DescriptionEn = "Beef patty, cheddar, lettuce, tomato, and house sauce.",
                DescriptionAr = "قطعة لحم، شيدر، خس، طماطم، وصوص خاص.",
                Price = 180,
                ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
                SortOrder = 1,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = pizza.Id,
                NameEn = "Margherita Pizza",
                NameAr = "بيتزا مارغريتا",
                DescriptionEn = "Fresh tomato sauce, mozzarella, basil.",
                DescriptionAr = "صلصة طماطم طازجة، موزاريلا، وريحان.",
                Price = 220,
                ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
                SortOrder = 2,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = drinks.Id,
                NameEn = "Fresh Orange Juice",
                NameAr = "عصير برتقال طازج",
                DescriptionEn = "Freshly squeezed orange juice.",
                DescriptionAr = "عصير برتقال معصور طازج.",
                Price = 60,
                ImageUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
                SortOrder = 3,
                IsAvailable = true
            },
            new MenuItem
            {
                CategoryId = desserts.Id,
                NameEn = "Chocolate Cake",
                NameAr = "كيكة شوكولاتة",
                DescriptionEn = "Moist chocolate cake with cocoa glaze.",
                DescriptionAr = "كيكة شوكولاتة غنية مع تغطية كاكاو.",
                Price = 95,
                ImageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
                SortOrder = 4,
                IsAvailable = true
            }
        );

        await db.SaveChangesAsync(ct);
    }
}
