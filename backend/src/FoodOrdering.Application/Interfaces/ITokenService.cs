using FoodOrdering.Domain.Entities;

namespace FoodOrdering.Application.Interfaces;

public interface ITokenService
{
    (string token, DateTime expiresAtUtc) CreateToken(User user);
}
