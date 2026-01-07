using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Models;
using System.Collections.Generic;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/business/jobs")]
    public class BusinessJobsController : ControllerBase
    {
        private readonly BookingDataAccess _bookings;

        public BusinessJobsController(BookingDataAccess bookings)
        {
            _bookings = bookings;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Job>> GetAllJobs()
        {
            var jobList = _bookings.GetAllJobs();
            return Ok(jobList);
        }

        [HttpPut("{jobId}/complete")]
        public IActionResult MarkJobCompleted(string jobId)
        {
            _bookings.MarkJobCompleted(jobId);
            return NoContent();
        }
    }
}
