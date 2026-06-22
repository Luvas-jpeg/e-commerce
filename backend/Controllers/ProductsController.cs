using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;
using EquipamentosMedicosApi.Services;

namespace EquipamentosMedicosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        /// <summary>Lista todos os produtos (com filtro opcional por tipo)</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? tipo)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(tipo))
                query = query.Where(p => p.TipoProduto == tipo);

            var products = await query
                .Select(p => new ProductResponseDTO
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    Preco = p.Preco,
                    TipoProduto = p.TipoProduto,
                    Estoque = p.Estoque ?? 0,
                    Description = p.Description,
                    Image = p.Image,
                    Category = p.Category,
                    Date = p.Date,
                    Location = p.Location,
                    Instructor = p.Instructor
                })
                .ToListAsync();

            return Ok(products);
        }

        /// <summary>Retorna um produto pelo ID</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound(new { message = "Produto não encontrado." });

            return Ok(ToResponse(product));
        }

        /// <summary>Cria um produto ou curso</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] ProductRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var product = new Product();
            ApplyRequest(product, request);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToResponse(product));
        }

        /// <summary>Atualiza um produto ou curso</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return NotFound(new { message = "Produto não encontrado." });

            ApplyRequest(product, request);
            await _context.SaveChangesAsync();

            return Ok(ToResponse(product));
        }

        /// <summary>Remove um produto ou curso</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return NotFound(new { message = "Produto não encontrado." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
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

        private static string? ValidateRequest(ProductRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Nome))
                return "Nome é obrigatório.";

            if (request.Preco < 0)
                return "Preço não pode ser negativo.";

            if (request.TipoProduto != "equipment" && request.TipoProduto != "course")
                return "TipoProduto deve ser 'equipment' ou 'course'.";

            if (request.Estoque < 0)
                return "Estoque não pode ser negativo.";

            return null;
        }
    }
}
