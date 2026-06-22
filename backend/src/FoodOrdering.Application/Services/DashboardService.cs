using FoodOrdering.Application.DTOs.Dashboard;
using FoodOrdering.Application.Interfaces;
using FoodOrdering.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Application.Services;

public class DashboardService
{
    private readonly IAppDbContext _db;

    public DashboardService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;

        var totalSales = await _db.Orders.Where(x => x.Status != OrderStatus.Cancelled).SumAsync(x => (decimal?)x.Total, ct) ?? 0m;
        var todaySales = await _db.Orders.Where(x => x.Status != OrderStatus.Cancelled && x.CreatedAt >= today).SumAsync(x => (decimal?)x.Total, ct) ?? 0m;

        return new DashboardSummaryDto
        {
            UsersCount = await _db.Users.CountAsync(ct),
            OrdersCount = await _db.Orders.CountAsync(ct),
            PendingOrdersCount = await _db.Orders.CountAsync(x => x.Status == OrderStatus.Pending, ct),
            TotalSales = totalSales,
            TodaySales = todaySales,
            MenuItemsCount = await _db.MenuItems.CountAsync(ct)
        };
    }
}
