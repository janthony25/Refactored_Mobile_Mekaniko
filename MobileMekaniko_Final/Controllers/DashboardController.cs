﻿
using Microsoft.AspNetCore.Mvc;
using MobileMekaniko_Final.Models.Dto;
using MobileMekaniko_Final.Repository;
using MobileMekaniko_Final.Repository.IRepository;
using SQLitePCL;
using System.Drawing.Printing;

namespace MobileMekaniko_Final.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IUnitOfWork unitOfWork, ILogger<DashboardController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
       
            
        // GET : Dashboard
        public async Task<IActionResult> MyDashboard()
        {
            try
            {
                var totalCustomers = await _unitOfWork.Dashboard.GetTotalCustomersAsync();
                var totalCars = await _unitOfWork.Dashboard.GetTotalCarsAsync();
                var totalInvoices = await _unitOfWork.Dashboard.GetTotalInvoicesAsync();
                var totalQuotations = await _unitOfWork.Dashboard.GetTotalQuotationsAsync();

                var unpaidInvoices = await _unitOfWork.Dashboard.FilterUnpaidInvoicesAsync();

                // Create a view model to hold dashboard datas.
                var dashboardDto = new DashboardDto
                {
                    TotalCustomers = totalCustomers,
                    TotalCars = totalCars,
                    TotalInvoices = totalInvoices,
                    TotalQuotations = totalQuotations,
                    UnpaidInvoices = unpaidInvoices
                };

                _logger.LogInformation("Successfully fetched dashboard data.");
                return View(dashboardDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching dashboard data.");
                TempData["ErrorMessage"] = "An error occurred while processing dashboard data.";
                return View();
            }
        }

        // GET : Pie Chart 
        public async Task<IActionResult> GetFinancialData()
        {
            try
            {
                var totalInvoicedAmount = await _unitOfWork.Dashboard.GetTotalInvoicedAmountAsync();
                var totalPaidAmount = await _unitOfWork.Dashboard.GetTotalPaidAmountAsync();
                var remainingBalance = await _unitOfWork.Dashboard.GetRemainingBalanceAsync();

                var data = new
                {
                    totalInvoiceAmount = totalInvoicedAmount,
                    totalPaidAmount = totalPaidAmount,
                    remainingBalance = remainingBalance
                };

                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching financial data.");
                return StatusCode(500, "An error occurred while processing financial data.");
            }
        }

        public async Task<IActionResult> GetMonthlyFinancialData()
        {
            try
            {
                // Fetch monthly data for total invoiced amount and total paid amount
                var monthlyData = await _unitOfWork.Dashboard.GetMonthlyFinancialDataAsync();

                // Prepare data for the chart
                var data = new
                {
                    months = monthlyData.Select(d => d.MonthName).ToList(),  // ['January', 'February', ...]
                    totalInvoicedAmounts = monthlyData.Select(d => d.TotalInvoicedAmount).ToList(),
                    totalPaidAmounts = monthlyData.Select(d => d.TotalPaidAmount).ToList()
                };

                return Json(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching monthly financial data.");
                return StatusCode(500, "An error occurred while processing financial data.");
            }
        }
    }
}
