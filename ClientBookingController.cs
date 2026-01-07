using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.DataObjects;
using System;
using System.Collections.Generic;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client-bookings")]
    public class ClientBookingsController : ControllerBase
    {
        private readonly BookingDataAccess _bookings;
        private readonly QuoteDataAccess _quotes;
        private readonly InvoiceDataAccess _invoices;
        private readonly ClientDataAccess _clients;

        public ClientBookingsController(
            BookingDataAccess bookings,
            QuoteDataAccess quotes,
            InvoiceDataAccess invoices,
            ClientDataAccess clients)
        {
            _bookings = bookings;
            _quotes = quotes;
            _invoices = invoices;
            _clients = clients;
        }

        [HttpGet("{clientId}")]
        public ActionResult<IEnumerable<ClientBooking>> GetAllBookings(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
            {
                return BadRequest(new { message = "Client ID is required." });
            }

            var bookingList =
                _bookings.GetBookingsForClient(clientId);

            return Ok(bookingList);
        }

        [HttpGet("{clientId}/next")]
        public ActionResult<NextBooking> GetNextBooking(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
            {
                return BadRequest(new { message = "Client ID is required." });
            }

            var nextBooking =
                _bookings.GetNextBookingForClient(clientId);

            if (nextBooking == null || !nextBooking.HasBooking)
            {
                return Ok(new NextBooking { HasBooking = false });
            }

            return Ok(nextBooking);
        }

        [HttpGet("{clientId}/quotes")]
        public ActionResult<IEnumerable<ClientQuote>> GetQuotes(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
            {
                return BadRequest(new { message = "Client ID is required." });
            }

            var quoteList =
                _quotes.GetQuotesForClient(clientId);

            return Ok(quoteList);
        }

        [HttpPost("quotes/{quoteId}/accept")]
        public IActionResult AcceptQuote(string quoteId)
        {
            if (string.IsNullOrWhiteSpace(quoteId))
            {
                return BadRequest(new { message = "Invalid quote ID." });
            }

            try
            {
                _quotes.SetQuoteAccepted(quoteId, true);
                _quotes.UpdateJobStatusByQuote(
                    quoteId,
                    "Quote Accepted"
                );

                return Ok(new { message = "Quote accepted." });
            }
            catch (Exception exception)
            {
                return BadRequest(new
                {
                    message = exception.Message
                });
            }
        }

        [HttpPost("quotes/{quoteId}/decline")]
        public IActionResult DeclineQuote(string quoteId)
        {
            if (string.IsNullOrWhiteSpace(quoteId))
            {
                return BadRequest(new { message = "Invalid quote ID." });
            }

            try
            {
                _quotes.SetQuoteAccepted(quoteId, false);
                _quotes.UpdateJobStatusByQuote(
                    quoteId,
                    "Quote Declined"
                );

                return Ok(new { message = "Quote declined." });
            }
            catch (Exception exception)
            {
                return BadRequest(new
                {
                    message = exception.Message
                });
            }
        }

        [HttpGet("{clientId}/invoices")]
        public ActionResult<IEnumerable<ClientInvoice>> GetInvoices(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
            {
                return BadRequest(new { message = "Client ID is required." });
            }

            var invoiceList =
                _invoices.GetInvoicesForClient(clientId);

            return Ok(invoiceList);
        }

        [HttpDelete("{jobId}")]
        public IActionResult CancelBooking(string jobId)
        {
            if (string.IsNullOrWhiteSpace(jobId))
            {
                return BadRequest(new { message = "Invalid job ID." });
            }

            var jobDetails =
                _bookings.GetJobById(jobId);

            if (jobDetails == null)
            {
                return NotFound(new { message = "Job not found." });
            }

            if (jobDetails.Status == "Completed")
            {
                return BadRequest(new
                {
                    message = "Completed jobs cannot be cancelled."
                });
            }

            _bookings.DeleteAppointmentByJob(jobId);
            _bookings.DeleteQuoteByJob(jobId);
            _bookings.DeleteJob(jobId);

            return Ok(new
            {
                message = "Booking cancelled successfully."
            });
        }
    }
}
