using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        /// <summary>Registra um novo usuário</summary>
        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromBody] RegistroDTO request)
        {
            // Verifica se e-mail já existe
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict(new { message = "E-mail já cadastrado." });

            if (!IsValidCpf(request.Cpf))
                return BadRequest(new { message = "CPF invalido." });

            var user = new User
            {
                Nome = request.Nome,
                Email = request.Email,
                Cpf = request.Cpf,
                Phone = request.Phone,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                Role = "Cliente"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuário cadastrado com sucesso!", userId = user.ID });
        }

        /// <summary>Realiza login e retorna token JWT</summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Senha, user.SenhaHash))
                return Unauthorized(new { message = "E-mail ou senha inválidos." });

            var token = GerarToken(user);

            return Ok(new
            {
                token,
                user = ToResponse(user)
            });
        }

        [HttpPut("perfil")]
        [Authorize]
        public async Task<IActionResult> AtualizarPerfil([FromBody] UpdateProfileDTO request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                           ?? User.FindFirst(JwtRegisteredClaimNames.Sub)
                           ?? User.FindFirst("sub");

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);
            if (user == null)
                return NotFound(new { message = "Usuário não encontrado." });

            var email = request.Email.Trim();
            if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Nome e e-mail são obrigatórios." });

            if (!IsValidCpf(request.Cpf))
                return BadRequest(new { message = "CPF invalido." });

            var duplicatedEmail = await _context.Users
                .AnyAsync(u => u.ID != userId && u.Email == email);
            if (duplicatedEmail)
                return Conflict(new { message = "E-mail já cadastrado." });

            user.Nome = request.Nome.Trim();
            user.Email = email;
            user.Cpf = request.Cpf.Trim();
            user.Phone = request.Phone.Trim();
            user.Street = request.Street.Trim();
            user.Number = request.Number.Trim();
            user.Complement = request.Complement.Trim();
            user.Neighborhood = request.Neighborhood.Trim();
            user.City = request.City.Trim();
            user.State = request.State.Trim();
            user.ZipCode = request.ZipCode.Trim();

            await _context.SaveChangesAsync();

            return Ok(ToResponse(user));
        }

        private string GerarToken(User user)
        {
            var secret = _config["Jwt:Secret"];
            if (string.IsNullOrWhiteSpace(secret))
                throw new InvalidOperationException("Jwt:Secret não foi configurado.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.ID.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("name", user.Nome),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expiration = double.TryParse(_config["Jwt:ExpirationHours"], out var h) ? h : 24;

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiration),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UserResponseDTO ToResponse(User user)
        {
            return new UserResponseDTO
            {
                Id = user.ID,
                Nome = user.Nome,
                Email = user.Email,
                Cpf = user.Cpf,
                Phone = user.Phone,
                Street = user.Street,
                Number = user.Number,
                Complement = user.Complement,
                Neighborhood = user.Neighborhood,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Role = user.Role
            };
        }

        private static bool IsValidCpf(string cpf)
        {
            var digits = new string(cpf.Where(char.IsDigit).ToArray());

            if (digits.Length != 11 || digits.Distinct().Count() == 1)
                return false;

            static int CalculateDigit(string value, int factor)
            {
                var total = 0;

                foreach (var digit in value)
                    total += (digit - '0') * factor--;

                var rest = (total * 10) % 11;
                return rest == 10 ? 0 : rest;
            }

            var firstDigit = CalculateDigit(digits[..9], 10);
            var secondDigit = CalculateDigit(digits[..10], 11);

            return firstDigit == digits[9] - '0'
                && secondDigit == digits[10] - '0';
        }
    }
}
