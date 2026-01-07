using Dapper;
using Neaproject.DataObjects;
using System.Collections.Generic;

namespace Neaproject.Data
{
    public class QuoteDataAccess
    {
        private readonly SqliteDataAccess _db;

        public QuoteDataAccess(SqliteDataAccess db)
        {
            _db = db;
        }

        public IEnumerable<ClientQuote> GetQuotesForClient(string clientId)
        {
            using var connection = _db.GetConnection();

            return connection.Query<ClientQuote>(@"
                SELECT 
                    q.QuoteID,
                    j.JobID,
                    s.ServiceName,
                    q.EstPrice,
                    q.EstDuration,
                    q.Accepted
                FROM Quotes q
                JOIN Jobs j ON q.JobID = j.JobID
                JOIN Services s ON j.ServiceID = s.ServiceID
                WHERE j.ClientID = @ClientID;",
                new { ClientID = clientId }
            );
        }

        public IEnumerable<ClientQuote> GetAllQuotes()
        {
            using var connection = _db.GetConnection();

            return connection.Query<ClientQuote>(@"
                SELECT 
                    q.QuoteID,
                    j.JobID,
                    s.ServiceName,
                    q.EstPrice,
                    q.EstDuration,
                    q.Accepted
                FROM Quotes q
                JOIN Jobs j ON q.JobID = j.JobID
                JOIN Services s ON j.ServiceID = s.ServiceID;");
        }

        public void SetQuoteAccepted(string quoteId, bool accepted)
        {
            using var connection = _db.GetConnection();

            int acceptedValue = accepted ? 1 : 0;

            connection.Execute(
                "UPDATE Quotes SET Accepted = @Accepted WHERE QuoteID = @QuoteID;",
                new
                {
                    Accepted = acceptedValue,
                    QuoteID = quoteId
                }
            );
        }

        public void InsertQuote(
            string quoteId,
            string jobId,
            decimal estimatedPrice,
            int estimatedDuration)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                INSERT INTO Quotes
                (QuoteID, JobID, EstPrice, EstDuration, Accepted)
                VALUES
                (@QuoteID, @JobID, @Price, @Duration, 0);",
                new
                {
                    QuoteID = quoteId,
                    JobID = jobId,
                    Price = estimatedPrice,
                    Duration = estimatedDuration
                }
            );
        }

        public void InsertQuoteItem(
            string quoteItemId,
            string quoteId,
            string supplyId,
            decimal quantity,
            decimal unitPrice)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                INSERT INTO QuoteItems
                (QuoteItemID, QuoteID, SupplyID, Quantity, UnitPrice)
                VALUES
                (@ItemID, @QuoteID, @SupplyID, @Quantity, @UnitPrice);",
                new
                {
                    ItemID = quoteItemId,
                    QuoteID = quoteId,
                    SupplyID = supplyId,
                    Quantity = quantity,
                    UnitPrice = unitPrice
                }
            );
        }

        public void UpdateJobStatusByQuote(
            string quoteId,
            string newStatus)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                UPDATE Jobs
                SET Status = @Status
                WHERE JobID = (
                    SELECT JobID FROM Quotes WHERE QuoteID = @QuoteID
                );",
                new
                {
                    Status = newStatus,
                    QuoteID = quoteId
                }
            );
        }
    }
}
