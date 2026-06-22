namespace FoodOrdering.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int UsersCount { get; set; }
    public int OrdersCount { get; set; }
    public int PendingOrdersCount { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TodaySales { get; set; }
    public int MenuItemsCount { get; set; }
}
