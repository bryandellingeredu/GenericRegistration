using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class website2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrationEventsWebsite_RegistrationEvents_RegistrationEventId",
                table: "RegistrationEventsWebsite");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RegistrationEventsWebsite",
                table: "RegistrationEventsWebsite");

            migrationBuilder.RenameTable(
                name: "RegistrationEventsWebsite",
                newName: "RegistrationEventsWebsites");

            migrationBuilder.RenameIndex(
                name: "IX_RegistrationEventsWebsite_RegistrationEventId",
                table: "RegistrationEventsWebsites",
                newName: "IX_RegistrationEventsWebsites_RegistrationEventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RegistrationEventsWebsites",
                table: "RegistrationEventsWebsites",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrationEventsWebsites_RegistrationEvents_RegistrationEventId",
                table: "RegistrationEventsWebsites",
                column: "RegistrationEventId",
                principalTable: "RegistrationEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrationEventsWebsites_RegistrationEvents_RegistrationEventId",
                table: "RegistrationEventsWebsites");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RegistrationEventsWebsites",
                table: "RegistrationEventsWebsites");

            migrationBuilder.RenameTable(
                name: "RegistrationEventsWebsites",
                newName: "RegistrationEventsWebsite");

            migrationBuilder.RenameIndex(
                name: "IX_RegistrationEventsWebsites_RegistrationEventId",
                table: "RegistrationEventsWebsite",
                newName: "IX_RegistrationEventsWebsite_RegistrationEventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RegistrationEventsWebsite",
                table: "RegistrationEventsWebsite",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrationEventsWebsite_RegistrationEvents_RegistrationEventId",
                table: "RegistrationEventsWebsite",
                column: "RegistrationEventId",
                principalTable: "RegistrationEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
