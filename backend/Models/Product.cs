namespace EquipamentosMedicosApi.Models
{
    public  class Product
    {
        public int Id {get; set;}
        public string Nome {get; set;} = string.Empty;
        public decimal Preco {get; set;}
        public string TipoProduto {get; set;} = string.Empty;
        public int? Estoque {get; set;}
        public string Description {get; set;} = string.Empty;
        public string Image {get; set;} = string.Empty;
        public string Category {get; set;} = string.Empty;
        public string Date {get; set;} = string.Empty;
        public string Location {get; set;} = string.Empty;
        public string Instructor {get; set;} = string.Empty;

        public ICollection<CourseClass>  Turmas {get; set;} = new List<CourseClass>();
    }
}
