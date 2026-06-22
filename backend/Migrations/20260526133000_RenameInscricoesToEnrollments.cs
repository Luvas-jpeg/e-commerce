using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RenameInscricoesToEnrollments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inscricoes_CourseClasses_TurmaId",
                table: "Inscricoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Inscricoes_Orders_PedidoId",
                table: "Inscricoes");

            migrationBuilder.RenameTable(
                name: "Inscricoes",
                newName: "Enrollments");

            migrationBuilder.RenameColumn(
                name: "TurmaId",
                table: "Enrollments",
                newName: "ClassId");

            migrationBuilder.RenameColumn(
                name: "StatusInscricao",
                table: "Enrollments",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "PedidoId",
                table: "Enrollments",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Inscricoes_TurmaId",
                table: "Enrollments",
                newName: "IX_Enrollments_ClassId");

            migrationBuilder.RenameIndex(
                name: "IX_Inscricoes_PedidoId",
                table: "Enrollments",
                newName: "IX_Enrollments_OrderId");

            migrationBuilder.DropColumn(
                name: "DocumentoParticipante",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "NomeParticipante",
                table: "Enrollments");

            migrationBuilder.AddColumn<int>(
                name: "StudentId",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "Instructor",
                table: "CourseClasses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_StudentId",
                table: "Enrollments",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_CourseClasses_ClassId",
                table: "Enrollments",
                column: "ClassId",
                principalTable: "CourseClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Orders_OrderId",
                table: "Enrollments",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Students_StudentId",
                table: "Enrollments",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_CourseClasses_ClassId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Orders_OrderId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Students_StudentId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_StudentId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "Instructor",
                table: "CourseClasses");

            migrationBuilder.AddColumn<string>(
                name: "DocumentoParticipante",
                table: "Enrollments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeParticipante",
                table: "Enrollments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Enrollments",
                newName: "StatusInscricao");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Enrollments",
                newName: "PedidoId");

            migrationBuilder.RenameColumn(
                name: "ClassId",
                table: "Enrollments",
                newName: "TurmaId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_OrderId",
                table: "Enrollments",
                newName: "IX_Inscricoes_PedidoId");

            migrationBuilder.RenameIndex(
                name: "IX_Enrollments_ClassId",
                table: "Enrollments",
                newName: "IX_Inscricoes_TurmaId");

            migrationBuilder.RenameTable(
                name: "Enrollments",
                newName: "Inscricoes");

            migrationBuilder.AddForeignKey(
                name: "FK_Inscricoes_CourseClasses_TurmaId",
                table: "Inscricoes",
                column: "TurmaId",
                principalTable: "CourseClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Inscricoes_Orders_PedidoId",
                table: "Inscricoes",
                column: "PedidoId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
