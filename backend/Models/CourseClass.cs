namespace EquipamentosMedicosApi.Models
{
    public class CourseClass
    {
        public int Id {get;set;}
        public int ProdutoId {get; set;}
        public DateTime DataRealizacao {get;set;}
        public string Local {get;set;} = string.Empty;
        public string Instructor {get;set;} = string.Empty;
        public int VafasDisponiveis {get; set;}

        public Product? Produto {get; set;}
        public ICollection<Enrollment> Enrollments {get; set;} = new List<Enrollment>();
    }
}
