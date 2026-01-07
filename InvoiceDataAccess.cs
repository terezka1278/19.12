using Dapper;
using Neaproject.DataObjects;
using System.Collections.Generic;

namespace Neaproject.Data
{
    public class InvoiceDataAccess
    {
        private readonly SqliteDataAccess _db;

        public InvoiceDataAccess(SqliteDataAccess db)
        {
            _db = db;
        }

        public IEnumerable<ClientInvoice> GetInvoicesForClient(string clientId)
        {
            using var connection = _db.GetConnection();

            return connection.Query<ClientInvoice>(@"
                SELECT 
                    i.InvoiceID,
                    j.JobID,
                    s.ServiceName,
                    i.FinalPrice,
                    i.PaymentStatus,
                    i.DepositPaid
                FROM Invoices i
                JOIN Jobs j ON i.JobID = j.JobID
                JOIN Services s ON j.ServiceID = s.ServiceID
                WHERE j.ClientID = @ClientID;",
                new { ClientID = clientId }
            );
        }

        public IEnumerable<ClientInvoice> GetAllInvoices()
        {
            using var connection = _db.GetConnection();

            return connection.Query<ClientInvoice>(@"
                SELECT 
                    i.InvoiceID,
                    j.JobID,
                    s.ServiceName,
                    i.FinalPrice,
                    i.PaymentStatus,
                    i.DepositPaid
                FROM Invoices i
                JOIN Jobs j ON i.JobID = j.JobID
                JOIN Services s ON j.ServiceID = s.ServiceID;");
        }

        public void InsertInvoiceHeader(
            string invoiceId,
            string jobId)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                INSERT INTO Invoices
                (InvoiceID, JobID, FinalPrice, PaymentStatus, DepositPaid)
                VALUES
                (@InvoiceID, @JobID, 0, 'Unpaid', 0);",
                new
                {
                    InvoiceID = invoiceId,
                    JobID = jobId
                }
            );
        }

        public void InsertInvoiceItem(
            string invoiceItemId,
            string invoiceId,
            string supplyId,
            decimal quantity)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                INSERT INTO InvoiceItems
                (InvoiceItemID, InvoiceID, SupplyID, ActualQuantity)
                VALUES
                (@ItemID, @InvoiceID, @SupplyID, @Quantity);",
                new
                {
                    ItemID = invoiceItemId,
                    InvoiceID = invoiceId,
                    SupplyID = supplyId,
                    Quantity = quantity
                }
            );
        }

        public void UpdateInvoiceTotal(
            string invoiceId,
            decimal total)
        {
            using var connection = _db.GetConnection();

            connection.Execute(
                "UPDATE Invoices SET FinalPrice = @Total WHERE InvoiceID = @InvoiceID;",
                new
                {
                    Total = total,
                    InvoiceID = invoiceId
                }
            );
        }
    }
}
