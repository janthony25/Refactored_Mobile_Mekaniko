﻿
using Azure.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using MobileMekaniko_Final.Data;
using MobileMekaniko_Final.Models;
using MobileMekaniko_Final.Models.Dto;
using MobileMekaniko_Final.Repository.IRepository;
using NuGet.Protocol;
using System.Reflection.Metadata.Ecma335;

namespace MobileMekaniko_Final.Repository
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _data;
        private readonly ILogger<CustomerRepository> _logger;

        public CustomerRepository(ApplicationDbContext data, ILoggerFactory loggerFactory )
        {
            _data = data;
            _logger = loggerFactory.CreateLogger<CustomerRepository>();
        }

        public async Task AddCustomerAsync(CustomerDetailsDto dto)
        {
            try
            {
                var customer = new Customer
                {
                    CustomerName = dto.CustomerName,
                    CustomerAddress = dto.CustomerAddress,
                    CustomerEmail = dto.CustomerEmail,
                    CustomerNumber = dto.CustomerNumber
                };

                _logger.LogInformation($"Adding customer {dto.CustomerName} to the database.");

                _data.Customers.Add(customer);
                await _data.SaveChangesAsync();

                _logger.LogInformation($"Successfully added {dto.CustomerName} to the database.");
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Unable to add customer.");
                throw;
            }
        }

        public async Task DeleteCustomerAsync(int id)
        {
            try
            {
                // Find customer by Id
                var customer = await _data.Customers.FindAsync(id);

                if (customer == null)
                {
                    _logger.LogInformation($"No customer was found with id {id}");
                    throw new KeyNotFoundException("Customer not found.");
                }

                _logger.LogInformation($"Found customer with id {id}, deleting...");

                _data.Customers.Remove(customer);
                await _data.SaveChangesAsync();
            }
            catch(Exception ex)
            {
                _logger.LogWarning(ex, $"Something went wrong while deleting customer with id {id}");
                throw;
            }
        }

        public async Task<CustomerDetailsDto> GetCustomerDetailsAsync(int id)
        {
            try
            {
                var customer = await _data.Customers
                    .Where(c => c.CustomerId == id)
                    .Select(c => new CustomerDetailsDto
                    {
                        CustomerId = c.CustomerId,
                        CustomerName = c.CustomerName,
                        CustomerAddress = c.CustomerAddress,
                        CustomerEmail = c.CustomerEmail,
                        CustomerNumber = c.CustomerNumber,
                        DateAdded = c.DateAdded,
                        DateEdited = c.DateEdited
                    }).FirstOrDefaultAsync();

                if (customer != null)
                {
                    _logger.LogInformation($"Successfully fetched customer: {customer.CustomerName} with id {id}");
                    return customer;
                }
                else
                {
                    _logger.LogInformation($"No customer was found with id {id}. Creating new customer now.");
                    return null;
                }

                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while fetching customer with id: {id}");
                throw;
            }
        }

        public async Task<List<CustomerListSummaryDto>> GetCustomersAsync()
        {
            try
            {
                var customer = await _data.Customers
                    .Select(c => new CustomerListSummaryDto
                    {
                        CustomerId = c.CustomerId,
                        CustomerName = c.CustomerName,
                        CustomerEmail = c.CustomerEmail,
                        CustomerNumber = c.CustomerNumber
                    }).ToListAsync();

                return customer;
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex, "An error occurred while fetching customers.");
                throw;
            }
        }

        public async Task<List<CustomerListSummaryDto>> SearchCustomerByNameAsync(string customerName)
        {
            try
            {

                if (string.IsNullOrEmpty(customerName))
                {
                    _logger.LogInformation("customer name is empty. Fetching all customers.");
                    return await GetCustomersAsync();
                }

                // Find customer by Id
                var customer = await _data.Customers
                    .Where(c => c.CustomerName.Contains(customerName))
                    .Select(c => new CustomerListSummaryDto
                    {
                        CustomerId = c.CustomerId,
                        CustomerName = c.CustomerName,
                        CustomerEmail = c.CustomerEmail,
                        CustomerNumber = c.CustomerNumber
                    }).ToListAsync();

                _logger.LogInformation($"Successfully found {customer.Count} customers with {customerName} in their name.");
                return customer;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Something went wrong while fetching customer with {customerName} in their name.");
                throw;
            }
        }

        public async Task UpdateCustomerAsync(CustomerDetailsDto dto)
        {
            try
            {
                var customer = await _data.Customers.FindAsync(dto.CustomerId);

                _logger.LogInformation($"Found customer with id {dto.CustomerId}");

                if (customer == null)
                {
                    _logger.LogInformation($"No customer was found with id {dto.CustomerId}");
                    throw new KeyNotFoundException("No customer found.");
                }

                customer.CustomerName = dto.CustomerName;
                customer.CustomerAddress = dto.CustomerAddress;
                customer.CustomerEmail = dto.CustomerEmail;
                customer.CustomerNumber = dto.CustomerNumber;
                customer.DateEdited = DateTime.Now;

                _logger.LogInformation($"Updating customer {dto.CustomerName} with id {dto.CustomerId}");

                _data.SaveChangesAsync();

                _logger.LogInformation($"Customer {dto.CustomerName} was updated successfully!");
            }
            catch(Exception ex)
            {
                _logger.LogWarning("Something went wrong while updating customer");
                throw;
            }
        }
    }
}
