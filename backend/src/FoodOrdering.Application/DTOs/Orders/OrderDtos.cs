using FoodOrdering.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace FoodOrdering.Application.DTOs.Orders;

public class CreateOrderItemRequest
{
    [Required]
    public Guid MenuItemId { get; set; }

    [Range(1, 99)]
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    [Required, MinLength(2)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, MinLength(5)]
    public string DeliveryAddress { get; set; } = string.Empty;

    [Required, MinLength(2)]
    public string City { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid MenuItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}

public class OrderStatusHistoryDto
{
    public DateTime ChangedAtUtc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string ChangedBy { get; set; } = string.Empty;
}

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class OrderDetailsDto : OrderSummaryDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
    public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
}

public class UpdateOrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;
}
