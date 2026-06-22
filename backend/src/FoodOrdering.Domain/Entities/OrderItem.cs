using FoodOrdering.Domain.Common;

namespace FoodOrdering.Domain.Entities;

public class OrderItem : EntityBase
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid MenuItemId { get; set; }
    public MenuItem? MenuItem { get; set; }

    public string ItemName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
