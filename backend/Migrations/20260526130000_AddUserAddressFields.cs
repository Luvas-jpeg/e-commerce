using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "Street", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "Number", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "Complement", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "Neighborhood", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "City", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "State", table: "Users", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "ZipCode", table: "Users", type: "text", nullable: false, defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Street", table: "Users");
            migrationBuilder.DropColumn(name: "Number", table: "Users");
            migrationBuilder.DropColumn(name: "Complement", table: "Users");
            migrationBuilder.DropColumn(name: "Neighborhood", table: "Users");
            migrationBuilder.DropColumn(name: "City", table: "Users");
            migrationBuilder.DropColumn(name: "State", table: "Users");
            migrationBuilder.DropColumn(name: "ZipCode", table: "Users");
        }
    }
}
