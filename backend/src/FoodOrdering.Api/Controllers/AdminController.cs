using System.Security.Claims;
using FoodOrdering.Application.DTOs.Dashboard;
using FoodOrdering.Application.DTOs.Menu;
using FoodOrdering.Application.DTOs.Orders;
using FoodOrdering.Application.Services;
using FoodOrdering.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminController : ControllerBase
{
    private readonly MenuService _menuService;
    private readonly OrderService _orderService;
    private readonly DashboardService _dashboardService;

    public AdminController(MenuService menuService, OrderService orderService, DashboardService dashboardService)
    {
        _menuService = menuService;
        _orderService = orderService;
        _dashboardService = dashboardService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardSummaryDto>> Dashboard(CancellationToken ct)
        => Ok(await _dashboardService.GetSummaryAsync(ct));

    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderSummaryDto>>> AllOrders(CancellationToken ct)
        => Ok(await _orderService.GetAllAsync(ct));

    [HttpPut("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest request,
        CancellationToken ct)
    {
        if (request is null)
            return BadRequest(new { message = "Request body is required." });

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            return BadRequest(new { message = "Invalid order status." });

        Guid? adminId = null;
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(uid, out var parsed))
            adminId = parsed;

        await _orderService.UpdateStatusAsync(id, status, request.Note, adminId, ct);
        return NoContent();
    }

    [HttpPost("menu-items")]
    public async Task<ActionResult<MenuItemDto>> CreateMenuItem(CreateMenuItemRequest request, CancellationToken ct)
        => Ok(await _menuService.CreateAsync(request, ct));

    [HttpPut("menu-items/{id:guid}")]
    public async Task<ActionResult<MenuItemDto>> UpdateMenuItem(Guid id, UpdateMenuItemRequest request, CancellationToken ct)
        => Ok(await _menuService.UpdateAsync(id, request, ct));

    [HttpDelete("menu-items/{id:guid}")]
    public async Task<IActionResult> DeleteMenuItem(Guid id, CancellationToken ct)
    {
        await _menuService.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("upload-image")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<object>> UploadImage([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "File is required." });

        var url = await _menuService.UploadImageAsync(file, ct);
        return Ok(new { url });
    }
}