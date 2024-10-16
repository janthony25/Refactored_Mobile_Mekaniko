using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileMekaniko_Final.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactoredInvoiceandInvoiceItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "LaborPrice",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ShippingFee",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ItemPrice",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "ItemTotal",
                table: "InvoiceItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LaborPrice",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingFee",
                table: "Invoices",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ItemPrice",
                table: "InvoiceItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ItemTotal",
                table: "InvoiceItems",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
