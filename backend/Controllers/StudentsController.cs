using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StudentsController : ControllerBase
    {
        private static readonly HashSet<string> AllowedStatuses = new()
        {
            "active",
            "completed",
            "cancelled"
        };

        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var students = await _context.Students
                .OrderBy(s => s.Name)
                .Select(s => ToResponse(s))
                .ToListAsync();

            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var student = await _context.Students
                .Include(s => s.Enrollments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                return NotFound(new { message = "Aluno não encontrado." });

            return Ok(ToResponse(student));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StudentRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var student = new Student();
            ApplyRequest(student, request);

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = student.Id }, ToResponse(student));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StudentRequestDTO request)
        {
            var validation = ValidateRequest(request);
            if (validation != null)
                return BadRequest(new { message = validation });

            var student = await _context.Students
                .Include(s => s.Enrollments)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (student == null)
                return NotFound(new { message = "Aluno não encontrado." });

            ApplyRequest(student, request);
            foreach (var enrollment in student.Enrollments)
                enrollment.Status = student.Status;

            await _context.SaveChangesAsync();

            return Ok(ToResponse(student));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);
            if (student == null)
                return NotFound(new { message = "Aluno não encontrado." });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static StudentDTO ToResponse(Student student)
        {
            return new StudentDTO
            {
                Id = student.Id,
                Name = student.Name,
                Email = student.Email,
                Phone = student.Phone,
                CourseId = student.CourseId,
                CourseName = student.CourseName,
                EnrollmentDate = student.EnrollmentDate,
                Status = student.Status
            };
        }

        private static void ApplyRequest(Student student, StudentRequestDTO request)
        {
            student.Name = request.Name.Trim();
            student.Email = request.Email.Trim();
            student.Phone = request.Phone.Trim();
            student.CourseId = request.CourseId.Trim();
            student.CourseName = request.CourseName.Trim();
            student.EnrollmentDate = request.EnrollmentDate.Trim();
            student.Status = request.Status.Trim();
        }

        private static string? ValidateRequest(StudentRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return "Nome é obrigatório.";

            if (string.IsNullOrWhiteSpace(request.Email))
                return "E-mail é obrigatório.";

            if (string.IsNullOrWhiteSpace(request.CourseId))
                return "Curso é obrigatório.";

            if (!AllowedStatuses.Contains(request.Status))
                return "Status deve ser 'active', 'completed' ou 'cancelled'.";

            return null;
        }
    }
}
