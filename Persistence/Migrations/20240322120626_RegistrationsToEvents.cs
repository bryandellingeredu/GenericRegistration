using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RegistrationsToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Registrations_RegistrationEventId",
                table: "Registrations",
                column: "RegistrationEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_RegistrationEvents_RegistrationEventId",
                table: "Registrations",
                column: "RegistrationEventId",
                principalTable: "RegistrationEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_RegistrationEvents_RegistrationEventId",
                table: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Registrations_RegistrationEventId",
                table: "Registrations");
        }
    }
}
