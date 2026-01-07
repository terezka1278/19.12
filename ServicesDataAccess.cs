using Dapper;
using System.Collections.Generic;

namespace Neaproject.Data
{
    public class ServiceDataAccess
    {
        private readonly SqliteDataAccess _db;

        public ServiceDataAccess(SqliteDataAccess db)
        {
            _db = db;
        }

        public string GetServiceIdForJob(string jobId)
        {
            using var connection = _db.GetConnection();

            string? serviceId =
                connection.ExecuteScalar<string>(
                    "SELECT ServiceID FROM Jobs WHERE JobID = @JobID;",
                    new { JobID = jobId }
                );

            if (string.IsNullOrWhiteSpace(serviceId))
            {
                return string.Empty;
            }

            return serviceId;
        }

        public decimal GetServiceBasePrice(string serviceId)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<decimal>(
                "SELECT BasePrice FROM Services WHERE ServiceID = @ServiceID;",
                new { ServiceID = serviceId }
            );
        }

        public int GetServiceBaseDuration(string serviceId)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<int>(
                "SELECT BaseDuration FROM Services WHERE ServiceID = @ServiceID;",
                new { ServiceID = serviceId }
            );
        }

        public IEnumerable<(string SupplyID, decimal UnitPrice, decimal Quantity)>
            GetServiceSupplies(string serviceId)
        {
            using var connection = _db.GetConnection();

            return connection.Query<(string, decimal, decimal)>(@"
                SELECT 
                    ss.SupplyID,
                    s.UnitPrice,
                    ss.Quantity
                FROM ServiceSupplies ss
                JOIN Supplies s ON ss.SupplyID = s.SupplyID
                WHERE ss.ServiceID = @ServiceID;",
                new { ServiceID = serviceId }
            );
        }

        public decimal GetSupplyUnitPrice(string supplyId)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<decimal>(
                "SELECT UnitPrice FROM Supplies WHERE SupplyID = @SupplyID;",
                new { SupplyID = supplyId }
            );
        }
    }
}
