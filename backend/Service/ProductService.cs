using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Services;

public class ProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductResponseDTO>> GetAllAsync(string? tipo)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(tipo))
        {
            query = query.Where(p => p.TipoProduto == tipo);
        }

        return await query
            .Select(p => ToResponse(p))
            .ToListAsync();
    }

    public async Task<ProductResponseDTO?> GetByIdAsync(int id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return null;
        }

        return ToResponse(product);
    }

    public async Task<ProductResponseDTO> CreateAsync(ProductRequestDTO request)
    {
        var product = new Product();

        ApplyRequest(product, request);

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return ToResponse(product);
    }

    public async Task<ProductResponseDTO?> UpdateAsync(int id, ProductRequestDTO request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return null;
        }

        ApplyRequest(product, request);

        await _context.SaveChangesAsync();

        return ToResponse(product);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return false;
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return true;
    }

    public string? ValidateRequest(ProductRequestDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            return "Nome é obrigatório.";
        }

        if (request.Preco < 0)
        {
            return "Preço não pode ser negativo.";
        }

        if (request.TipoProduto != "equipment" && request.TipoProduto != "course")
        {
            return "TipoProduto deve ser 'equipment' ou 'course'.";
        }

        if (request.Estoque < 0)
        {
            return "Estoque não pode ser negativo.";
        }

        return null;
    }

    private static ProductResponseDTO ToResponse(Product product)
    {
        return new ProductResponseDTO
        {
            Id = product.Id,
            Nome = product.Nome,
            Preco = product.Preco,
            TipoProduto = product.TipoProduto,
            Estoque = product.Estoque ?? 0,
            Description = product.Description,
            Image = product.Image,
            Category = product.Category,
            Date = product.Date,
            Location = product.Location,
            Instructor = product.Instructor
        };
    }

    private static void ApplyRequest(Product product, ProductRequestDTO request)
    {
        product.Nome = request.Nome.Trim();
        product.Preco = request.Preco;
        product.TipoProduto = request.TipoProduto.Trim();
        product.Estoque = request.Estoque;
        product.Description = request.Description.Trim();
        product.Image = request.Image.Trim();
        product.Category = request.Category.Trim();
        product.Date = request.Date.Trim();
        product.Location = request.Location.Trim();
        product.Instructor = request.Instructor.Trim();
    }
}