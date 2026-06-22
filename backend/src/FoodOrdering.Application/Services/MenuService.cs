using FoodOrdering.Application.DTOs.Menu;
using FoodOrdering.Application.Interfaces;
using FoodOrdering.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
namespace FoodOrdering.Application.Services;

public class MenuService
{
    private readonly IAppDbContext _db;
    private readonly IFileStorageService _files;

    public MenuService(IAppDbContext db, IFileStorageService files)
    {
        _db = db;
        _files = files;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .OrderBy(x => x.NameEn)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                NameEn = x.NameEn,
                NameAr = x.NameAr,
                Slug = x.Slug,
                IsActive = x.IsActive
            })
            .ToListAsync(ct);
    }

    public async Task<List<MenuItemDto>> GetMenuItemsAsync(Guid? categoryId = null, bool? onlyAvailable = null, CancellationToken ct = default)
    {
        var query = _db.MenuItems.Include(x => x.Category).AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(x => x.CategoryId == categoryId.Value);

        if (onlyAvailable.HasValue)
            query = query.Where(x => x.IsAvailable == onlyAvailable.Value);

        return await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.NameEn)
            .Select(x => new MenuItemDto
            {
                Id = x.Id,
                CategoryId = x.CategoryId,
                CategoryNameEn = x.Category!.NameEn,
                CategoryNameAr = x.Category!.NameAr,
                NameEn = x.NameEn,
                NameAr = x.NameAr,
                DescriptionEn = x.DescriptionEn,
                DescriptionAr = x.DescriptionAr,
                Price = x.Price,
                ImageUrl = x.ImageUrl,
                IsAvailable = x.IsAvailable,
                SortOrder = x.SortOrder
            })
            .ToListAsync(ct);
    }

    public async Task<MenuItemDto> GetMenuItemAsync(Guid id, CancellationToken ct = default)
    {
        var item = await _db.MenuItems.Include(x => x.Category).FirstAsync(x => x.Id == id, ct);
        return new MenuItemDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            CategoryNameEn = item.Category!.NameEn,
            CategoryNameAr = item.Category!.NameAr,
            NameEn = item.NameEn,
            NameAr = item.NameAr,
            DescriptionEn = item.DescriptionEn,
            DescriptionAr = item.DescriptionAr,
            Price = item.Price,
            ImageUrl = item.ImageUrl,
            IsAvailable = item.IsAvailable,
            SortOrder = item.SortOrder
        };
    }

    public async Task<MenuItemDto> CreateAsync(CreateMenuItemRequest request, CancellationToken ct = default)
    {
        if (!await _db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            throw new InvalidOperationException("Category not found.");

        var entity = new MenuItem
        {
            CategoryId = request.CategoryId,
            NameEn = request.NameEn.Trim(),
            NameAr = request.NameAr.Trim(),
            DescriptionEn = request.DescriptionEn.Trim(),
            DescriptionAr = request.DescriptionAr.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl?.Trim() ?? string.Empty,
            IsAvailable = request.IsAvailable,
            SortOrder = request.SortOrder
        };

        _db.MenuItems.Add(entity);
        await _db.SaveChangesAsync(ct);
        return await GetMenuItemAsync(entity.Id, ct);
    }

    public async Task<MenuItemDto> UpdateAsync(Guid id, UpdateMenuItemRequest request, CancellationToken ct = default)
    {
        var entity = await _db.MenuItems.FirstAsync(x => x.Id == id, ct);

        if (!await _db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            throw new InvalidOperationException("Category not found.");

        entity.CategoryId = request.CategoryId;
        entity.NameEn = request.NameEn.Trim();
        entity.NameAr = request.NameAr.Trim();
        entity.DescriptionEn = request.DescriptionEn.Trim();
        entity.DescriptionAr = request.DescriptionAr.Trim();
        entity.Price = request.Price;
        entity.ImageUrl = request.ImageUrl?.Trim() ?? string.Empty;
        entity.IsAvailable = request.IsAvailable;
        entity.SortOrder = request.SortOrder;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetMenuItemAsync(id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.MenuItems.FirstAsync(x => x.Id == id, ct);
        _db.MenuItems.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<string> UploadImageAsync(IFormFile file, CancellationToken ct = default)
    {
        return await _files.SaveImageAsync(file, ct);
    }
}
