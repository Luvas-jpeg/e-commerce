namespace EquipamentosMedicosApi.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string EnrollmentDate { get; set; } = string.Empty;
        public string Status { get; set; } = "active";

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}
