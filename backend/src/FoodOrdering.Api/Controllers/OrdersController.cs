using System.Security.Claims;
using FoodOrdering.Application.DTOs.Orders;
using FoodOrdering.Application.Services;
using FoodOrdering.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orders;

    public OrdersController(OrderService orders)
    {
        _orders = orders;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetailsDto>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(id, out var userId))
            return Unauthorized();

        return Ok(await _orders.CreateAsync(userId, request, ct));
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<OrderSummaryDto>>> MyOrders(CancellationToken ct)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(id, out var userId))
            return Unauthorized();

        return Ok(await _orders.GetMyOrdersAsync(userId, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDetailsDto>> GetById(Guid id, CancellationToken ct)
    {
        var isAdmin = User.IsInRole(UserRole.Admin.ToString());
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        return Ok(await _orders.GetByIdAsync(userId, id, isAdmin, ct));
    }
}
