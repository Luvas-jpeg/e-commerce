using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Services;

public class InventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<Dictionary<int, Product>>> ValidateAndReserveAsync(List<CreateOrderItemDTO> items)
    {
        if (items.Count == 0)
        {
            return ServiceResult<Dictionary<int, Product>>.Fail("Pedido deve possuir ao menos um item.");
        }

        var productIds = items
            .Select(item => item.ProdutoId)
            .Distinct()
            .ToList();

        var products = await _context.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id);

        foreach (var item in items)
        {
            if (!products.TryGetValue(item.ProdutoId, out var product))
            {
                return ServiceResult<Dictionary<int, Product>>.Fail($"Produto #{item.ProdutoId} nao encontrado.");
            }

            if (item.Quantidade <= 0)
            {
                return ServiceResult<Dictionary<int, Product>>.Fail("Quantidade deve ser maior que zero.");
            }

            var currentStock = product.Estoque ?? 0;

            if (currentStock < item.Quantidade)
            {
                return ServiceResult<Dictionary<int, Product>>.Fail($"Estoque/vagas insuficientes para {product.Nome}.");
            }

            product.Estoque = currentStock - item.Quantidade;
        }

        return ServiceResult<Dictionary<int, Product>>.Ok(products);
    }
}