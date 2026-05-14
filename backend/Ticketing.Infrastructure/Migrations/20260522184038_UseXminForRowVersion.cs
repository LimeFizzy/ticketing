using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ticketing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UseXminForRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Events" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "EventTicketTypes" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "EventScanners" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "EventVenueMapPlaces" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "Orders" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "PromoCodes" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "Reviews" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "Tickets" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "RowVersion";
                ALTER TABLE "VenueMaps" DROP COLUMN IF EXISTS "RowVersion";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "VenueMaps",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Users",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Tickets",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Reviews",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "PromoCodes",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Orders",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EventVenueMapPlaces",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EventTicketTypes",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "EventScanners",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Events",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }
    }
}
