using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentsAndPromoCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PromoCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Discount = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountType = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<string>(type: "text", nullable: false),
                    EndDate = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UsageLimit = table.Column<int>(type: "integer", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromoCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    CourseId = table.Column<string>(type: "text", nullable: false),
                    CourseName = table.Column<string>(type: "text", nullable: false),
                    EnrollmentDate = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.Sql("""
                INSERT INTO "PromoCodes" ("Id", "Code", "Discount", "DiscountType", "EndDate", "IsActive", "StartDate", "UsageCount", "UsageLimit")
                VALUES
                    (1, 'MEDICO10', 10, 'percentage', '2026-12-31', TRUE, '2026-04-01', 5, 100),
                    (2, 'PRIMEIRACOMPRA', 50, 'fixed', '2026-12-31', TRUE, '2026-01-01', 12, NULL)
                ON CONFLICT ("Id") DO NOTHING;

                INSERT INTO "Students" ("Id", "CourseId", "CourseName", "Email", "EnrollmentDate", "Name", "Phone", "Status")
                VALUES
                    (1, '5', 'Curso de Primeiros Socorros Básico', 'joao.silva@email.com', '10/04/2026', 'João Silva', '(11) 98765-4321', 'active'),
                    (2, '6', 'Curso de Suporte Avançado de Vida (ACLS)', 'maria.santos@email.com', '05/04/2026', 'Maria Santos', '(21) 99876-5432', 'active'),
                    (3, '7', 'Workshop de Técnicas de Sutura', 'pedro.oliveira@email.com', '28/03/2026', 'Pedro Oliveira', '(31) 97654-3210', 'completed')
                ON CONFLICT ("Id") DO NOTHING;
                """);

            migrationBuilder.Sql("""
                SELECT setval(pg_get_serial_sequence('"PromoCodes"', 'Id'), COALESCE((SELECT MAX("Id") FROM "PromoCodes"), 1));
                SELECT setval(pg_get_serial_sequence('"Students"', 'Id'), COALESCE((SELECT MAX("Id") FROM "Students"), 1));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PromoCodes");

            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}
