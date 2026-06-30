using Microsoft.EntityFrameworkCore;
using EquipamentosMedicosApi.Data;
using EquipamentosMedicosApi.DTOs;
using EquipamentosMedicosApi.Models;

namespace EquipamentosMedicosApi.Services;

public class StudentService
{
    private static readonly HashSet<string> AllowedStatuses = new()
    {
        "active",
        "completed",
        "cancelled"
    };

    private readonly AppDbContext _context;

    public StudentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentDTO>> GetAllAsync()
    {
        return await _context.Students
            .OrderBy(student => student.Name)
            .Select(student => ToResponse(student))
            .ToListAsync();
    }

    public async Task<StudentDTO?> GetByIdAsync(int id)
    {
        var student = await _context.Students
            .Include(student => student.Enrollments)
            .FirstOrDefaultAsync(student => student.Id == id);

        return student == null ? null : ToResponse(student);
    }

    public async Task<ServiceResult<StudentDTO>> CreateAsync(StudentRequestDTO request)
    {
        var validation = ValidateRequest(request);
        if (validation != null)
        {
            return ServiceResult<StudentDTO>.Fail(validation);
        }

        var student = new Student();
        ApplyRequest(student, request);

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return ServiceResult<StudentDTO>.Ok(ToResponse(student));
    }

    public async Task<ServiceResult<StudentDTO>> UpdateAsync(int id, StudentRequestDTO request)
    {
        var validation = ValidateRequest(request);
        if (validation != null)
        {
            return ServiceResult<StudentDTO>.Fail(validation);
        }

        var student = await _context.Students
            .Include(student => student.Enrollments)
            .FirstOrDefaultAsync(student => student.Id == id);

        if (student == null)
        {
            return ServiceResult<StudentDTO>.Fail("Aluno nao encontrado.");
        }

        ApplyRequest(student, request);

        foreach (var enrollment in student.Enrollments)
        {
            enrollment.Status = student.Status;
        }

        await _context.SaveChangesAsync();

        return ServiceResult<StudentDTO>.Ok(ToResponse(student));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var student = await _context.Students.FirstOrDefaultAsync(student => student.Id == id);

        if (student == null)
        {
            return false;
        }

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        return true;
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
        {
            return "Nome e obrigatorio.";
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return "E-mail e obrigatorio.";
        }

        if (string.IsNullOrWhiteSpace(request.CourseId))
        {
            return "Curso e obrigatorio.";
        }

        if (!AllowedStatuses.Contains(request.Status))
        {
            return "Status deve ser 'active', 'completed' ou 'cancelled'.";
        }

        return null;
    }
}
