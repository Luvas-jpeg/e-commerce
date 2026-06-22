using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private static readonly HashSet<string> AllowedStatuses = new()
        {
            "Pendente",
            "Processando",
            "Concluído",
            "Cancelado"
        };

        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>Cria um novo pedido para o usuário autenticado</summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDTO request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                           ?? User.FindFirst("sub");

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);
            if (user == null)
                return Unauthorized();

            if (request.Itens.Count == 0)
                return BadRequest(new { message = "Pedido deve possuir ao menos um item." });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            var productIds = request.Itens.Select(i => i.ProdutoId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            foreach (var item in request.Itens)
            {
                if (!products.TryGetValue(item.ProdutoId, out var product))
                    return BadRequest(new { message = $"Produto #{item.ProdutoId} não encontrado." });

                if (item.Quantidade <= 0)
                    return BadRequest(new { message = "Quantidade deve ser maior que zero." });

                var currentStock = product.Estoque ?? 0;
                if (currentStock < item.Quantidade)
                    return BadRequest(new { message = $"Estoque/vagas insuficientes para {product.Nome}." });

                product.Estoque = currentStock - item.Quantidade;
            }

            var subtotal = request.Itens.Sum(i => i.PrecoUnitario * i.Quantidade);
            var discount = 0m;
            var paymentMethod = request.PaymentMethod.Trim().ToLower();

            if (paymentMethod != "credit" && paymentMethod != "debit" && paymentMethod != "pix")
                return BadRequest(new { message = "Forma de pagamento invalida." });

            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var promoCode = await _context.PromoCodes
                    .FirstOrDefaultAsync(p => p.Code == request.PromoCode.Trim().ToUpper());

                if (promoCode == null || !IsValidPromoCode(promoCode))
                    return BadRequest(new { message = "Codigo promocional invalido." });

                discount = promoCode.DiscountType == "percentage"
                    ? subtotal * (promoCode.Discount / 100)
                    : promoCode.Discount;

                discount = Math.Min(discount, subtotal);
                promoCode.UsageCount += 1;
            }

            var order = new Order
            {
                UsuarioId = userId,
                DataPedido = DateTime.UtcNow,
                Status = "Pendente",
                ValorFrete = request.ValorFrete,
                PaymentMethod = paymentMethod,
                Installments = paymentMethod == "credit" ? request.Installments : null,
                PromoCode = request.PromoCode.Trim().ToUpper(),
                Itens = request.Itens.Select(i => new OrderItem
                {
                    ProdutoId = i.ProdutoId,
                    Quantidade = i.Quantidade,
                    PrecoUnitario = i.PrecoUnitario
                }).ToList()
            };

            order.Total = subtotal + request.ValorFrete - discount;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in request.Itens)
            {
                var product = products[item.ProdutoId];
                if (product.TipoProduto != "course")
                    continue;

                var student = await _context.Students.FirstOrDefaultAsync(s =>
                    s.Email == user.Email &&
                    s.CourseId == product.Id.ToString());

                if (student == null)
                {
                    student = new Student
                    {
                        Name = user.Nome,
                        Email = user.Email,
                        Phone = user.Phone,
                        CourseId = product.Id.ToString(),
                        CourseName = product.Nome,
                        EnrollmentDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                        Status = "active"
                    };

                    _context.Students.Add(student);
                    await _context.SaveChangesAsync();
                }

                var courseClass = await _context.CourseClasses
                    .FirstOrDefaultAsync(c => c.ProdutoId == product.Id);

                if (courseClass == null)
                {
                    courseClass = new CourseClass
                    {
                        ProdutoId = product.Id,
                        DataRealizacao = ParseCourseDate(product.Date),
                        Local = product.Location,
                        Instructor = product.Instructor,
                        VafasDisponiveis = (product.Estoque ?? 0) + item.Quantidade
                    };

                    _context.CourseClasses.Add(courseClass);
                    await _context.SaveChangesAsync();
                }

                courseClass.VafasDisponiveis = Math.Max(0, courseClass.VafasDisponiveis - item.Quantidade);

                for (var i = 0; i < item.Quantidade; i++)
                {
                    _context.Enrollments.Add(new Enrollment
                    {
                        ClassId = courseClass.Id,
                        StudentId = student.Id,
                        OrderId = order.Id,
                        Status = "active"
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetMyOrders), new { id = order.Id },
                new { message = "Pedido criado com sucesso!", orderId = order.Id, total = order.Total });
        }

        /// <summary>Lista os pedidos do usuário autenticado</summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                           ?? User.FindFirst("sub");

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);
            if (user == null)
                return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.UsuarioId == userId)
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                .OrderByDescending(o => o.DataPedido)
                .Select(o => new
                {
                    o.Id,
                    o.DataPedido,
                    o.Status,
                    o.Total,
                    o.ValorFrete,
                    o.PaymentMethod,
                    o.Installments,
                    o.PromoCode,
                    Itens = o.Itens.Select(i => new
                    {
                        i.ProdutoId,
                        Nome = i.Produto != null ? i.Produto.Nome : string.Empty,
                        TipoProduto = i.Produto != null ? i.Produto.TipoProduto : "equipment",
                        i.Quantidade,
                        i.PrecoUnitario,
                        Status = i.Produto != null && i.Produto.TipoProduto == "course"
                            ? _context.Students
                                .Where(s => s.Email == user.Email && s.CourseId == i.ProdutoId.ToString())
                                .Select(s => s.Status)
                                .FirstOrDefault()
                            : null
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Usuario)
                .Include(o => o.Itens)
                    .ThenInclude(i => i.Produto)
                .OrderByDescending(o => o.DataPedido)
                .Select(o => new
                {
                    o.Id,
                    o.DataPedido,
                    o.Status,
                    o.Total,
                    o.ValorFrete,
                    o.PaymentMethod,
                    o.Installments,
                    o.PromoCode,
                    Usuario = o.Usuario == null ? null : new
                    {
                        id = o.Usuario.ID,
                        nome = o.Usuario.Nome,
                        email = o.Usuario.Email
                    },
                    Itens = o.Itens.Select(i => new
                    {
                        i.ProdutoId,
                        Nome = i.Produto != null ? i.Produto.Nome : string.Empty,
                        TipoProduto = i.Produto != null ? i.Produto.TipoProduto : "equipment",
                        i.Quantidade,
                        i.PrecoUnitario
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDTO request)
        {
            var status = request.Status.Trim();
            if (!AllowedStatuses.Contains(status))
                return BadRequest(new { message = "Status inválido." });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                return NotFound(new { message = "Pedido não encontrado." });

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(new { order.Id, order.Status });
        }

        private static DateTime ParseCourseDate(string date)
        {
            var firstDate = date.Split('-', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();

            if (DateTime.TryParseExact(firstDate, "dd/MM/yyyy", CultureInfo.GetCultureInfo("pt-BR"), DateTimeStyles.None, out var parsed))
                return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);

            return DateTime.UtcNow;
        }

        private static bool IsValidPromoCode(PromoCode promoCode)
        {
            if (!promoCode.IsActive)
                return false;

            if (promoCode.UsageLimit.HasValue && promoCode.UsageCount >= promoCode.UsageLimit.Value)
                return false;

            if (!DateOnly.TryParse(promoCode.StartDate, out var startDate) ||
                !DateOnly.TryParse(promoCode.EndDate, out var endDate))
                return false;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            return today >= startDate && today <= endDate;
        }
    }
}
