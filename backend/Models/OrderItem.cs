namespace EquipamentosMedicosApi.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int PedidoId { get; set; }
        public int ProdutoId { get; set; }
        public int? TurmaId { get; set; }
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }

        //Relacionamentos
        public Order? Pedido { get; set; }
        public Product? Produto { get; set; }
        public CourseClass? Turma { get; set; }
    }
}