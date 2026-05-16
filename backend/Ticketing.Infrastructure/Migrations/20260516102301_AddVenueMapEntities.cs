using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ticketing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVenueMapEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "VenueMapPlaceId",
                table: "Tickets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "PromoCodeId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            // Clear existing text VenueMapId values, then change column type using USING clause
            migrationBuilder.Sql("UPDATE \"Events\" SET \"VenueMapId\" = NULL WHERE \"VenueMapId\" IS NOT NULL");
            migrationBuilder.Sql("ALTER TABLE \"Events\" ALTER COLUMN \"VenueMapId\" TYPE uuid USING NULL::uuid");
            migrationBuilder.Sql("ALTER TABLE \"Events\" ALTER COLUMN \"VenueMapId\" DROP DEFAULT");

            migrationBuilder.CreateTable(
                name: "EmailLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientEmail = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    EmailType = table.Column<string>(type: "text", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PromoCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    DiscountType = table.Column<string>(type: "text", nullable: false),
                    DiscountValue = table.Column<decimal>(type: "numeric", nullable: false),
                    MaxUses = table.Column<int>(type: "integer", nullable: true),
                    CurrentUses = table.Column<int>(type: "integer", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromoCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PromoCodes_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VenueMaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VenueMaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VenueMaps_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "VenueMapDecorations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    X = table.Column<double>(type: "double precision", nullable: false),
                    Y = table.Column<double>(type: "double precision", nullable: false),
                    Width = table.Column<double>(type: "double precision", nullable: false),
                    Height = table.Column<double>(type: "double precision", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    VenueMapId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VenueMapDecorations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VenueMapDecorations_VenueMaps_VenueMapId",
                        column: x => x.VenueMapId,
                        principalTable: "VenueMaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VenueMapPlaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    X = table.Column<double>(type: "double precision", nullable: false),
                    Y = table.Column<double>(type: "double precision", nullable: false),
                    Width = table.Column<double>(type: "double precision", nullable: true),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    VenueMapId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VenueMapPlaces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VenueMapPlaces_VenueMaps_VenueMapId",
                        column: x => x.VenueMapId,
                        principalTable: "VenueMaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventVenueMapPlaces",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    VenueMapPlaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventTicketTypeId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventVenueMapPlaces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventVenueMapPlaces_EventTicketTypes_EventTicketTypeId",
                        column: x => x.EventTicketTypeId,
                        principalTable: "EventTicketTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventVenueMapPlaces_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventVenueMapPlaces_VenueMapPlaces_VenueMapPlaceId",
                        column: x => x.VenueMapPlaceId,
                        principalTable: "VenueMapPlaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_VenueMapPlaceId",
                table: "Tickets",
                column: "VenueMapPlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PromoCodeId",
                table: "Orders",
                column: "PromoCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Events_VenueMapId",
                table: "Events",
                column: "VenueMapId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailLogs_CreatedAt",
                table: "EmailLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_EmailLogs_EventId_EmailType",
                table: "EmailLogs",
                columns: new[] { "EventId", "EmailType" });

            migrationBuilder.CreateIndex(
                name: "IX_EmailLogs_OrderId_EmailType",
                table: "EmailLogs",
                columns: new[] { "OrderId", "EmailType" });

            migrationBuilder.CreateIndex(
                name: "IX_EventVenueMapPlaces_EventId_VenueMapPlaceId",
                table: "EventVenueMapPlaces",
                columns: new[] { "EventId", "VenueMapPlaceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventVenueMapPlaces_EventTicketTypeId",
                table: "EventVenueMapPlaces",
                column: "EventTicketTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_EventVenueMapPlaces_VenueMapPlaceId",
                table: "EventVenueMapPlaces",
                column: "VenueMapPlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_PromoCodes_Code_EventId",
                table: "PromoCodes",
                columns: new[] { "Code", "EventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromoCodes_EventId",
                table: "PromoCodes",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_EventId",
                table: "Reviews",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_EventId_UserId",
                table: "Reviews",
                columns: new[] { "EventId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId",
                table: "Reviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VenueMapDecorations_VenueMapId",
                table: "VenueMapDecorations",
                column: "VenueMapId");

            migrationBuilder.CreateIndex(
                name: "IX_VenueMapPlaces_VenueMapId",
                table: "VenueMapPlaces",
                column: "VenueMapId");

            migrationBuilder.CreateIndex(
                name: "IX_VenueMaps_CreatedBy",
                table: "VenueMaps",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_VenueMaps_VenueMapId",
                table: "Events",
                column: "VenueMapId",
                principalTable: "VenueMaps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_PromoCodes_PromoCodeId",
                table: "Orders",
                column: "PromoCodeId",
                principalTable: "PromoCodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_VenueMapPlaces_VenueMapPlaceId",
                table: "Tickets",
                column: "VenueMapPlaceId",
                principalTable: "VenueMapPlaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_VenueMaps_VenueMapId",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_PromoCodes_PromoCodeId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_VenueMapPlaces_VenueMapPlaceId",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "EmailLogs");

            migrationBuilder.DropTable(
                name: "EventVenueMapPlaces");

            migrationBuilder.DropTable(
                name: "PromoCodes");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "VenueMapDecorations");

            migrationBuilder.DropTable(
                name: "VenueMapPlaces");

            migrationBuilder.DropTable(
                name: "VenueMaps");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_VenueMapPlaceId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Orders_PromoCodeId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Events_VenueMapId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "VenueMapPlaceId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PromoCodeId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "VenueMapId",
                table: "Events",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
