using System.Globalization;
using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Services;

public class EnrollmentService
{
    private readonly AppDbContext _context;

    public EnrollmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateEnrollmentsForCourseAsync(User user, Product product, Order order, int quantity)
    {
        if (product.TipoProduto != "course")
        {
            return;
        }

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
                VafasDisponiveis = (product.Estoque ?? 0) + quantity
            };

            _context.CourseClasses.Add(courseClass);
            await _context.SaveChangesAsync();
        }

        courseClass.VafasDisponiveis = Math.Max(0, courseClass.VafasDisponiveis - quantity);

        for (var i = 0; i < quantity; i++)
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

    private static DateTime ParseCourseDate(string date)
    {
        var firstDate = date
            .Split('-', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .FirstOrDefault();

        if (DateTime.TryParseExact(
            firstDate,
            "dd/MM/yyyy",
            CultureInfo.GetCultureInfo("pt-BR"),
            DateTimeStyles.None,
            out var parsed))
        {
            return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);
        }

        return DateTime.UtcNow;
    }
}