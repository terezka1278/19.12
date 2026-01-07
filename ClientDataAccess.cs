using Dapper;
using Neaproject.Models;
using System.Linq;

namespace Neaproject.Data
{
    public class ClientDataAccess
    {
        private readonly SqliteDataAccess _db;

        public ClientDataAccess(SqliteDataAccess db)
        {
            _db = db;
        }

        public User? GetUserByEmail(string email)
        {
            using var connection = _db.GetConnection();

            return connection.Query<User>(@"
                SELECT
                    ClientID AS Id,
                    Email,
                    Password,
                    Role
                FROM Clients
                WHERE Email = @Email;",
                new { Email = email }
            ).FirstOrDefault();
        }

        public bool EmailExists(string email)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<int>(
                "SELECT COUNT(1) FROM Clients WHERE Email = @Email;",
                new { Email = email }
            ) > 0;
        }

        public bool PhoneExists(string phoneNumber)
        {
            using var connection = _db.GetConnection();

            return connection.ExecuteScalar<int?>(
                "SELECT 1 FROM Clients WHERE PhoneNum = @PhoneNum LIMIT 1;",
                new { PhoneNum = phoneNumber }
            ) != null;
        }

        public void CreateClient(Client client)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                INSERT INTO Clients
                (ClientID, FirstName, LastName, Email, PhoneNum, Address, Postcode, Password, Role)
                VALUES
                (@ClientID, @FirstName, @LastName, @Email, @PhoneNum, @Address, @Postcode, @Password, @Role);",
                client
            );
        }

        public Client? GetClientById(string clientId)
        {
            using var connection = _db.GetConnection();

            return connection.QueryFirstOrDefault<Client>(@"
                SELECT *
                FROM Clients
                WHERE ClientID = @ClientID;",
                new { ClientID = clientId }
            );
        }

        public void UpdateClientFields(
            string clientId,
            string? email,
            string? phoneNumber,
            string? address,
            string? postcode,
            string? password)
        {
            using var connection = _db.GetConnection();

            connection.Execute(@"
                UPDATE Clients
                SET
                    Email = COALESCE(@Email, Email),
                    PhoneNum = COALESCE(@PhoneNum, PhoneNum),
                    Address = COALESCE(@Address, Address),
                    Postcode = COALESCE(@Postcode, Postcode),
                    Password = COALESCE(@Password, Password)
                WHERE ClientID = @ClientID;",
                new
                {
                    ClientID = clientId,
                    Email = email,
                    PhoneNum = phoneNumber,
                    Address = address,
                    Postcode = postcode,
                    Password = password
                }
            );
        }
    }
}
