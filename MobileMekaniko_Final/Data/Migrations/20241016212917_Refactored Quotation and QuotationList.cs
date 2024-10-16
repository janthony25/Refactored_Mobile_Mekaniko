using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileMekaniko_Final.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactoredQuotationandQuotationList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "LaborPrice",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ShippingFee",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ItemPrice",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "ItemTotal",
                table: "QuotationItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LaborPrice",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingFee",
                table: "Quotations",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ItemPrice",
                table: "QuotationItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ItemTotal",
                table: "QuotationItems",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
