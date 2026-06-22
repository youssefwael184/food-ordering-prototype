using FoodOrdering.Domain.Common;
using FoodOrdering.Domain.Enums;

namespace FoodOrdering.Domain.Entities;

public class OrderStatusHistory : EntityBase
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public OrderStatus Status { get; set; }
    public string Note { get; set; } = string.Empty;

    public Guid? ChangedByUserId { get; set; }
    public User? ChangedByUser { get; set; }
}
