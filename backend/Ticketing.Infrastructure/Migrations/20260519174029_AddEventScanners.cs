using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ticketing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEventScanners : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventScanners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrganizerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScannerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignToAllEvents = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventScanners", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventScanners_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventScanners_Users_OrganizerId",
                        column: x => x.OrganizerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventScanners_Users_ScannerUserId",
                        column: x => x.ScannerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventScanners_EventId",
                table: "EventScanners",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventScanners_OrganizerId",
                table: "EventScanners",
                column: "OrganizerId");

            migrationBuilder.CreateIndex(
                name: "IX_EventScanners_ScannerUserId",
                table: "EventScanners",
                column: "ScannerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EventScanners_ScannerUserId_EventId",
                table: "EventScanners",
                columns: new[] { "ScannerUserId", "EventId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventScanners");
        }
    }
}
