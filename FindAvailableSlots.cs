using Neaproject.Data;
using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace Neaproject.Functions
{
    public class FindAvailableSlots
    {
        private readonly SqliteDataAccess _db;

        public FindAvailableSlots(SqliteDataAccess db)
        {
            _db = db;
        }

        public List<AvailableDate> FindAvailableDates(
            string jobId,
            List<DayOfWeek> selectedDays,
            int timeFrame,
            int maxResults = 5)
        {
            var today = DateTime.Today;
            var availableDates = new List<AvailableDate>();

            using (var connection = _db.GetConnection())
            {
                connection.Open();

                // 🔹 Get job region from CLIENT postcode
                string jobRegion = GetJobRegion(jobId, connection);

                for (int offset = 1; offset <= timeFrame; offset++)
                {
                    DateTime currentDate = today.AddDays(offset);

                    if (!selectedDays.Contains(currentDate.DayOfWeek))
                    {
                        continue;
                    }

                    bool amSlotTaken = false;
                    bool pmSlotTaken = false;

                    // 🔹 Check existing bookings for this date
                    using (var slotCheckSql = new SQLiteCommand(@"
                        SELECT TimeSlot
                        FROM Appointments
                        WHERE ScheduledDate = @ScheduledDate;",
                        connection))
                    {
                        slotCheckSql.Parameters.AddWithValue(
                            "@ScheduledDate",
                            currentDate.ToString("yyyy-MM-dd")
                        );

                        using (var reader = slotCheckSql.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                int timeSlot = reader.GetInt32(0);

                                if (timeSlot == 1)
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

                    if (amSlotTaken && pmSlotTaken)
                    {
                        continue;
                    }

                    availableDates.Add(new AvailableDate
                    {
                        Date = currentDate.ToString("yyyy-MM-dd"),
                        AmAvailable = !amSlotTaken,
                        PmAvailable = !pmSlotTaken
                    });

                    if (availableDates.Count >= maxResults)
                    {
                        break;
                    }
                }
            }

            return availableDates;
        }

        // ==============================
        // GET JOB REGION (FROM CLIENT)
        // ==============================
        private string GetJobRegion(string jobId, SQLiteConnection connection)
        {
            using (var regionSql = new SQLiteCommand(@"
                SELECT c.Postcode
                FROM Jobs j
                JOIN Clients c ON j.ClientID = c.ClientID
                WHERE j.JobID = @JobID;
            ", connection))
            {
                regionSql.Parameters.AddWithValue("@JobID", jobId);

                var postcode = regionSql.ExecuteScalar()?.ToString();

                if (string.IsNullOrWhiteSpace(postcode))
                {
                    return "Unknown";
                }

                return LocationFinder.GetRegion(postcode);
            }
        }
    }

    // ==============================
    // DATA OBJECT
    // ==============================
    public class AvailableDate
    {
        public string? Date { get; set; }
        public bool AmAvailable { get; set; }
        public bool PmAvailable { get; set; }
    }
}
