using EquipamentosMedicosApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260503160000_AddCourseProductDetails")]
    public partial class AddCourseProductDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Date",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Instructor",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE "Products"
                SET "Date" = '15/04/2026 - 16/04/2026',
                    "Instructor" = 'Dr. Carlos Silva',
                    "Location" = 'São Paulo - SP'
                WHERE "Id" = 5;

                UPDATE "Products"
                SET "Date" = '22/04/2026 - 23/04/2026',
                    "Instructor" = 'Dra. Ana Paula Costa',
                    "Location" = 'Rio de Janeiro - RJ'
                WHERE "Id" = 6;

                UPDATE "Products"
                SET "Date" = '10/05/2026',
                    "Instructor" = 'Dr. Roberto Mendes',
                    "Location" = 'Belo Horizonte - MG'
                WHERE "Id" = 7;

                UPDATE "Products"
                SET "Date" = '18/04/2026',
                    "Instructor" = 'Enf. Marina Oliveira',
                    "Location" = 'Curitiba - PR'
                WHERE "Id" = 8;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Instructor",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Products");
        }
    }
}
