using System;
using System.Data.SQLite;
using System.IO;

namespace Neaproject.Data
{
    public class SqliteDataAccess
    {
        public SQLiteConnection GetConnection()
        {
            string databasePath =
                Path.Combine(
                    AppContext.BaseDirectory,
                    "database.db"
                );

            return new SQLiteConnection(
                $"Data Source={databasePath};Version=3;"
            );
        }
    }
}
