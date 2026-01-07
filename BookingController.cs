using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.DataObjects;
using Neaproject.Functions;
using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/booking")]
    public class BookingController : ControllerBase
    {
        private readonly BookingDataAccess _bookings;
        private readonly ClientDataAccess _clients;
        private readonly SqliteDataAccess _db;

        public BookingController(
            BookingDataAccess bookings,
            ClientDataAccess clients,
            SqliteDataAccess db)
        {
            _bookings = bookings;
            _clients = clients;
            _db = db;
        }

     
        [HttpPost("step1")]
        public IActionResult Step1([FromBody] BookingStep1Request model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "No data sent." });
            }

            string? clientId = model.ClientId;

            if (!string.IsNullOrWhiteSpace(model.ClientId))
            {
                var existingClient = _clients.GetClientById(model.ClientId);

                if (existingClient == null)
                {
                    return BadRequest(new { message = "Login invalid.", requiresLogin = true });
                }

                if (!string.Equals(existingClient.Email, model.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Email not correct.", requiresLogin = true });
                }

                clientId = model.ClientId;
            }
            else
            {
                if (_clients.EmailExists(model.Email))
                {
                    return BadRequest(new { message = "Account exists. Please log in.", requiresLogin = true });
                }

                return BadRequest(new { message = "No account found. Please create one.", requiresAccount = true });
            }

            string jobId = Guid.NewGuid().ToString();

            using (var connection = _db.GetConnection())
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction())
                {
                    using (var insertJobSql = new SQLiteCommand(@"
                        INSERT INTO Jobs (
                            JobID, ClientID, ServiceID,
                            DateStarted, DateFinished,
                            Status, Summary, NumOfPoints
                        )
                        VALUES (
                            @JobID, @ClientID, @ServiceID,
                            NULL, NULL,
                            'Not Started', @Summary, @Points
                        );", connection, transaction))
                    {
                        insertJobSql.Parameters.AddWithValue("@JobID", jobId);
                        insertJobSql.Parameters.AddWithValue("@ClientID", clientId);
                        insertJobSql.Parameters.AddWithValue("@ServiceID", model.Service);
                        insertJobSql.Parameters.AddWithValue("@Summary", model.Summary);
                        insertJobSql.Parameters.AddWithValue("@Points", model.Points);

                        insertJobSql.ExecuteNonQuery();
                    }

                    transaction.Commit();
                }
            }

            return Ok(new
            {
                clientId = clientId,
                jobId = jobId
            });
        }


        [HttpPost("step2")]
        public IActionResult Step2([FromBody] BookingStep2Request model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.JobId))
            {
                return BadRequest(new { message = "Invalid step 2 data." });
            }

            if (model.Days == null || model.Days.Count == 0)
            {
                return BadRequest(new { message = "Select at least one day." });
            }

            var selectedDays = new List<DayOfWeek>();

            foreach (string dayName in model.Days)
            {
                if (Enum.TryParse(dayName, true, out DayOfWeek parsedDay))
                {
                    selectedDays.Add(parsedDay);
                }
            }

            var slotFinder = new FindAvailableSlots(_db);

            var suggestedDates = slotFinder.FindAvailableDates(
                model.JobId,
                selectedDays,
                62,
                5
            );

            return Ok(new
            {
                jobId = model.JobId,
                suggestedDates = suggestedDates
            });
        }

        [HttpPost("step2/confirm")]
        public IActionResult ConfirmStep2([FromBody] BookingStep2ConfirmRequest model)
        {
            if (model == null ||
                string.IsNullOrWhiteSpace(model.JobId) ||
                string.IsNullOrWhiteSpace(model.SelectedDate) ||
                string.IsNullOrWhiteSpace(model.SelectedSlot))
            {
                return BadRequest(new { message = "Invalid confirmation data." });
            }

            if (!DateTime.TryParse(model.SelectedDate, out DateTime selectedDate))
            {
                return BadRequest(new { message = "Invalid date format." });
            }

            using (var connection = _db.GetConnection())
            {
                connection.Open();

                bool amSlotTaken = false;
                bool pmSlotTaken = false;

                using (var conflictCheckSql = new SQLiteCommand(@"
                    SELECT TimeSlot
                    FROM Appointments
                    WHERE ScheduledDate = @ScheduledDate;", connection))
                {
                    conflictCheckSql.Parameters.AddWithValue(
                        "@ScheduledDate",
                        selectedDate.ToString("yyyy-MM-dd")
                    );

                    using (var reader = conflictCheckSql.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            int existingSlot = reader.GetInt32(0);

                            if (existingSlot == 1)
                            {
                                amSlotTaken = true;
                            }
                            else
                            {
                                pmSlotTaken = true;
                            }
                        }
                    }
                }

                if (model.SelectedSlot == "AM" && amSlotTaken)
                {
                    return BadRequest(new { message = "AM slot already booked." });
                }

                if (model.SelectedSlot == "PM" && pmSlotTaken)
                {
                    return BadRequest(new { message = "PM slot already booked." });
                }

                int timeSlotValue;

                if (model.SelectedSlot == "AM")
                {
                    timeSlotValue = 1;
                }
                else
                {
                    timeSlotValue = 0;
                }

                using (var insertAppointmentSql = new SQLiteCommand(@"
                    INSERT INTO Appointments
                    (AppointmentID, JobID, ScheduledDate, TimeSlot)
                    VALUES
                    (@AppointmentID, @JobID, @ScheduledDate, @TimeSlot);", connection))
                {
                    insertAppointmentSql.Parameters.AddWithValue("@AppointmentID", Guid.NewGuid().ToString());
                    insertAppointmentSql.Parameters.AddWithValue("@JobID", model.JobId);
                    insertAppointmentSql.Parameters.AddWithValue("@ScheduledDate", selectedDate.ToString("yyyy-MM-dd"));
                    insertAppointmentSql.Parameters.AddWithValue("@TimeSlot", timeSlotValue);

                    insertAppointmentSql.ExecuteNonQuery();
                }

                using (var updateJobStatusSql = new SQLiteCommand(
                    "UPDATE Jobs SET Status = 'Booked' WHERE JobID = @JobID;",
                    connection))
                {
                    updateJobStatusSql.Parameters.AddWithValue("@JobID", model.JobId);
                    updateJobStatusSql.ExecuteNonQuery();
                }

                return Ok(new
                {
                    message = "Booking confirmed.",
                    jobId = model.JobId,
                    selectedDate = selectedDate.ToString("yyyy-MM-dd"),
                    timeSlot = model.SelectedSlot
                });
            }
        }
    }
}
