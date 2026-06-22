using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO "Users" ("Nome", "Email", "SenhaHash")
                SELECT
                    'Administrador',
                    'admin@medishop.com',
                    '$2a$11$kA7TdjhR42oMfEtlIldHB.LCKZg5/37RKJOh7/dOjcZoXOOjqNiqW'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM "Users"
                    WHERE "Email" = 'admin@medishop.com'
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "Users"
                WHERE "Email" = 'admin@medishop.com';
                """);
        }
    }
}
