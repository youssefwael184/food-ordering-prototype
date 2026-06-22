using FoodOrdering.Application.DTOs.Orders;
using FoodOrdering.Application.Interfaces;
using FoodOrdering.Domain.Entities;
using FoodOrdering.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Application.Services;

public class OrderService
{
    private readonly IAppDbContext _db;
    private const decimal DeliveryFeeDefault = 25m;

    public OrderService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<OrderDetailsDto> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken ct = default)
    {
        var ids = request.Items.Select(x => x.MenuItemId).Distinct().ToList();

        var menuItems = await _db.MenuItems
            .Include(x => x.Category)
            .Where(x => ids.Contains(x.Id) && x.IsAvailable)
            .ToListAsync(ct);

        if (menuItems.Count != ids.Count)
            throw new InvalidOperationException("One or more menu items are invalid or unavailable.");

        var order = new Order
        {
            UserId = userId,
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            CustomerName = request.CustomerName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            DeliveryAddress = request.DeliveryAddress.Trim(),
            City = request.City.Trim(),
            Notes = request.Notes?.Trim() ?? string.Empty,
            PaymentMethod = request.PaymentMethod,
            Status = OrderStatus.Pending,
            DeliveryFee = DeliveryFeeDefault,

            // ✅ FIX: prevent null crash
            Items = new List<OrderItem>(),
            StatusHistory = new List<OrderStatusHistory>()
        };

        foreach (var item in request.Items)
        {
            var menu = menuItems.First(x => x.Id == item.MenuItemId);

            order.Items.Add(new OrderItem
            {
                MenuItemId = menu.Id,
                ItemName = menu.NameEn,
                UnitPrice = menu.Price,
                Quantity = item.Quantity,
                LineTotal = menu.Price * item.Quantity
            });
        }

        order.Subtotal = order.Items.Sum(x => x.LineTotal);
        order.Total = order.Subtotal + order.DeliveryFee;

        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = OrderStatus.Pending,
            Note = "Order created."
        });

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(userId, order.Id, false, ct);
    }

    public async Task<List<OrderSummaryDto>> GetMyOrdersAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Orders
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderSummaryDto
            {
                Id = x.Id,
                OrderNumber = x.OrderNumber,
                CustomerName = x.CustomerName,
                Status = x.Status.ToString(),
                PaymentMethod = x.PaymentMethod.ToString(),
                Total = x.Total,
                CreatedAtUtc = x.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<OrderDetailsDto> GetByIdAsync(Guid userId, Guid orderId, bool isAdmin, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(x => x.Items)
                .ThenInclude(x => x.MenuItem)
            .Include(x => x.StatusHistory)
                .ThenInclude(x => x.ChangedByUser)
            .FirstOrDefaultAsync(x => x.Id == orderId, ct);

        if (order is null)
            throw new KeyNotFoundException("Order not found.");

        if (!isAdmin && order.UserId != userId)
            throw new UnauthorizedAccessException();

        return Map(order);
    }

    public async Task<List<OrderSummaryDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Orders
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderSummaryDto
            {
                Id = x.Id,
                OrderNumber = x.OrderNumber,
                CustomerName = x.CustomerName,
                Status = x.Status.ToString(),
                PaymentMethod = x.PaymentMethod.ToString(),
                Total = x.Total,
                CreatedAtUtc = x.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task UpdateStatusAsync(Guid orderId, OrderStatus status, string note, Guid? adminUserId, CancellationToken ct = default)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(x => x.Id == orderId, ct);

        if (order is null)
            throw new KeyNotFoundException("Order not found.");

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;

        var history = new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = status,
            Note = note ?? string.Empty,
            ChangedByUserId = adminUserId
        };

        _db.OrderStatusHistories.Add(history);

        await _db.SaveChangesAsync(ct);
    }

    private static OrderDetailsDto Map(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        CustomerName = order.CustomerName,
        Status = order.Status.ToString(),
        PaymentMethod = order.PaymentMethod.ToString(),
        Total = order.Total,
        CreatedAtUtc = order.CreatedAt,
        PhoneNumber = order.PhoneNumber,
        DeliveryAddress = order.DeliveryAddress,
        City = order.City,
        Notes = order.Notes,
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            MenuItemId = i.MenuItemId,
            ItemName = i.ItemName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            LineTotal = i.LineTotal,
            ImageUrl = i.MenuItem?.ImageUrl ?? string.Empty
        }).ToList(),
        StatusHistory = order.StatusHistory
            .OrderBy(x => x.CreatedAt)
            .Select(h => new OrderStatusHistoryDto
            {
                ChangedAtUtc = h.CreatedAt,
                Status = h.Status.ToString(),
                Note = h.Note,
                ChangedBy = h.ChangedByUser?.FullName ?? "System"
            }).ToList()
    };
}