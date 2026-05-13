using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ticketing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeSessionIdAndRemoveCardFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CardBrand",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CardExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CardHolderName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CardLast4",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "PaymentMethod",
                table: "Orders",
                newName: "StripeSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StripeSessionId",
                table: "Orders",
                newName: "PaymentMethod");

            migrationBuilder.AddColumn<string>(
                name: "CardBrand",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CardExpiry",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CardHolderName",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CardLast4",
                table: "Users",
                type: "text",
                nullable: true);
        }
    }
}
