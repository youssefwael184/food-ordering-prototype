namespace FoodOrdering.Application.Interfaces;
using Microsoft.AspNetCore.Http;
public interface IFileStorageService
{
    Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default);
}
