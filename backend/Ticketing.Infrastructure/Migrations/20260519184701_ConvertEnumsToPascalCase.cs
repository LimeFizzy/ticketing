using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ticketing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertEnumsToPascalCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Event.Status: lowercase -> PascalCase
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'Draft' WHERE ""Status"" = 'draft'");
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'Published' WHERE ""Status"" = 'published'");
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'Cancelled' WHERE ""Status"" = 'cancelled'");

            // User.Role: lowercase -> PascalCase
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'Admin' WHERE ""Role"" = 'admin'");
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'Organizer' WHERE ""Role"" = 'organizer'");
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'Attendee' WHERE ""Role"" = 'attendee'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Event.Status: PascalCase -> lowercase
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'draft' WHERE ""Status"" = 'Draft'");
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'published' WHERE ""Status"" = 'Published'");
            migrationBuilder.Sql(@"UPDATE ""Events"" SET ""Status"" = 'cancelled' WHERE ""Status"" = 'Cancelled'");

            // User.Role: PascalCase -> lowercase
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'admin' WHERE ""Role"" = 'Admin'");
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'organizer' WHERE ""Role"" = 'Organizer'");
            migrationBuilder.Sql(@"UPDATE ""Users"" SET ""Role"" = 'attendee' WHERE ""Role"" = 'Attendee'");
        }
    }
}
