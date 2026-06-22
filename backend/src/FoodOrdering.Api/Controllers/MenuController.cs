using FoodOrdering.Application.DTOs.Menu;
using FoodOrdering.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly MenuService _menuService;

    public MenuController(MenuService menuService)
    {
        _menuService = menuService;
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories(CancellationToken ct)
        => Ok(await _menuService.GetCategoriesAsync(ct));

    [HttpGet("items")]
    [AllowAnonymous]
    public async Task<ActionResult<List<MenuItemDto>>> GetItems([FromQuery] Guid? categoryId, [FromQuery] bool? onlyAvailable, CancellationToken ct)
        => Ok(await _menuService.GetMenuItemsAsync(categoryId, onlyAvailable, ct));

    [HttpGet("items/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<MenuItemDto>> GetItem(Guid id, CancellationToken ct)
        => Ok(await _menuService.GetMenuItemAsync(id, ct));
}
