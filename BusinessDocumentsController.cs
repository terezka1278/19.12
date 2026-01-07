using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.DataObjects;
using System;
using System.Collections.Generic;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/business/documents")]
    public class BusinessDocumentsController : ControllerBase
    {
        private readonly QuoteDataAccess _quotes;
        private readonly InvoiceDataAccess _invoices;
        private readonly ServiceDataAccess _services;
        private readonly BookingDataAccess _bookings;

        public BusinessDocumentsController(
            QuoteDataAccess quotes,
            InvoiceDataAccess invoices,
            ServiceDataAccess services,
            BookingDataAccess bookings)
        {
            _quotes = quotes;
            _invoices = invoices;
            _services = services;
            _bookings = bookings;
        }

        [HttpGet("quotes")]
        public ActionResult<IEnumerable<ClientQuote>> GetAllQuotes()
        {
            var quoteList = _quotes.GetAllQuotes();
            return Ok(quoteList);
        }

        [HttpPost("quotes/create")]
        public IActionResult CreateQuote([FromBody] string jobId)
        {
            if (string.IsNullOrWhiteSpace(jobId))
            {
                return BadRequest(new { message = "Invalid job ID." });
            }

            string serviceId = _services.GetServiceIdForJob(jobId);

            int jobPoints = _bookings.GetJobPoints(jobId);
            if (jobPoints <= 0)
            {
                jobPoints = 1;
            }

            decimal basePrice = _services.GetServiceBasePrice(serviceId);
            int baseDurationMinutes = _services.GetServiceBaseDuration(serviceId);

            decimal quoteTotal = basePrice;
            int estimatedDurationMinutes = baseDurationMinutes * jobPoints;

            string quoteId = Guid.NewGuid().ToString();

            var serviceSupplies = _services.GetServiceSupplies(serviceId);

            foreach (var supply in serviceSupplies)
            {
                decimal adjustedQuantity = supply.Quantity * jobPoints;
                decimal lineCost = adjustedQuantity * supply.UnitPrice;

                quoteTotal += lineCost;

                _quotes.InsertQuoteItem(
                    Guid.NewGuid().ToString(),
                    quoteId,
                    supply.SupplyID,
                    adjustedQuantity,
                    supply.UnitPrice
                );
            }

            _quotes.InsertQuote(
                quoteId,
                jobId,
                quoteTotal,
                estimatedDurationMinutes
            );

            _bookings.UpdateJobStatus(jobId, "Quote Submitted");

            return Ok(new
            {
                message = "Quote created successfully.",
                quoteId = quoteId,
                total = quoteTotal,
                estDurationMins = estimatedDurationMinutes
            });
        }

        [HttpGet("invoices")]
        public ActionResult<IEnumerable<ClientInvoice>> GetAllInvoices()
        {
            var invoiceList = _invoices.GetAllInvoices();
            return Ok(invoiceList);
        }

        [HttpPost("invoices/create")]
        public IActionResult CreateInvoice([FromBody] InvoiceCreateRequest model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.JobID))
            {
                return BadRequest(new { message = "Invalid invoice data." });
            }

            decimal invoiceTotal = 0m;
            string invoiceId = Guid.NewGuid().ToString();

            _invoices.InsertInvoiceHeader(invoiceId, model.JobID);

            foreach (var invoiceItem in model.Items)
            {
                decimal unitPrice =
                    _services.GetSupplyUnitPrice(invoiceItem.SupplyID);

                decimal lineCost =
                    unitPrice * invoiceItem.Quantity;

                invoiceTotal += lineCost;

                _invoices.InsertInvoiceItem(
                    Guid.NewGuid().ToString(),
                    invoiceId,
                    invoiceItem.SupplyID,
                    invoiceItem.Quantity
                );
            }

            invoiceTotal += model.LabourCost + model.ExtraCost;

            _invoices.UpdateInvoiceTotal(invoiceId, invoiceTotal);
            _bookings.UpdateJobStatus(model.JobID, "Invoiced");

            return Ok(new
            {
                message = "Invoice created successfully.",
                invoiceId = invoiceId,
                total = invoiceTotal
            });
        }
    }
}
