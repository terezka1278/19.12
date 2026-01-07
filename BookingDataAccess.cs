using Dapper;
using Neaproject.DataObjects;
using Neaproject.Models;
using System.Collections.Generic;

namespace Neaproject.Data
{
    public class BookingDataAccess
    {
        private readonly SqliteDataAccess _db;

        public BookingDataAccess(SqliteDataAccess db)
        {
            _db = db;
        }

        public IEnumerable<ClientBooking> GetBookingsForClient(string clientId)
        {
            using var connection = _db.GetConnection();

            return connection.Query<ClientBooking>(@"
                SELECT 
                    j.JobID,
                    s.ServiceName,
                    a.ScheduledDate,
                    a.TimeSlot AS TimeSlotPm,
                    j.Status,
                    q.EstPrice
                FROM Jobs j
                JOIN Services s ON j.ServiceID = s.ServiceID
                JOIN Appointments a ON j.JobID = a.JobID
                LEFT JOIN Quotes q ON j.JobID = q.JobID
                WHERE j.ClientID = @ClientID;",
                new { ClientID = clientId }
            );
        }

        public NextBooking GetNextBookingForClient(string clientId)
        {
            using var connection = _db.GetConnection();

            var booking =
                connection.QueryFirstOrDefault<NextBooking>(@"
                    SELECT 
                        j.JobID,
                        s.ServiceName,
                        a.ScheduledDate,
                        a.TimeSlot AS TimeSlotPm,
                        j.Status
                    FROM Jobs j
                    JOIN Services s ON j.ServiceID = s.ServiceID
                    JOIN Appointments a ON j.JobID = a.JobID
                    WHERE j.ClientID = @ClientID
                      AND date(a.ScheduledDate) >= date('now')
                      AND j.Status <> 'Completed'
                    ORDER BY date(a.ScheduledDate)
                    LIMIT 1;",
                    new { ClientID = clientId }
                );

            if (booking == null)
            {
                return new NextBooking { HasBooking = false };
            }

            booking.HasBooking = true;
            return booking;
        }

        public IEnumerable<Job> GetAllJobs()
        {
            using var connection = _db.GetConnection();

            return connection.Query<Job>(@"
                SELECT 
                    j.JobID,
                    c.FirstName || ' ' || c.LastName AS ClientName,
                    a.ScheduledDate,
                    j.Status,
                    s.ServiceName,
                    c.Address,
                    c.Postcode
                FROM Jobs j
                JOIN Clients c ON j.ClientID = c.ClientID
                JOIN Appointments a ON j.JobID = a.JobID
                JOIN Services s ON j.ServiceID = s.ServiceID;");
        }

        public void MarkJobCompleted(string jobId)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                UPDATE Jobs
                SET 
                    Status = 'Completed',
                    DateFinished = COALESCE(DateFinished, DATE('now'))
                WHERE JobID = @JobID;",
                new { JobID = jobId }
            );
        }

        public Job? GetJobById(string jobId)
        {
            using var connection = _db.GetConnection();

            return connection.QueryFirstOrDefault<Job>(
                "SELECT * FROM Jobs WHERE JobID = @JobID;",
                new { JobID = jobId }
            );
        }

        public int GetJobPoints(string jobId)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<int?>(
                "SELECT Points FROM Jobs WHERE JobID = @JobID;",
                new { JobID = jobId }
            ) ?? 1;
        }

        public void DeleteAppointmentByJob(string jobId)
        {
            using var connection = _db.GetConnection();

            connection.Execute(
                "DELETE FROM Appointments WHERE JobID = @JobID;",
                new { JobID = jobId }
            );
        }

        public void DeleteQuoteByJob(string jobId)
        {
            using var connection = _db.GetConnection();

            connection.Execute(
                "DELETE FROM Quotes WHERE JobID = @JobID;",
                new { JobID = jobId }
            );
        }

        public void DeleteJob(string jobId)
        {
            using var connection = _db.GetConnection();

            connection.Execute(
                "DELETE FROM Jobs WHERE JobID = @JobID;",
                new { JobID = jobId }
            );
        }

        public void UpdateJobStatus(
            string jobId,
            string newStatus)
        {
            using var connection = _db.GetConnection();

            connection.Execute(
                "UPDATE Jobs SET Status = @Status WHERE JobID = @JobID;",
                new
                {
                    Status = newStatus,
                    JobID = jobId
                }
            );
        }
    }
}
