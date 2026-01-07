using System;
using System.Security.Cryptography;
using System.Text;

namespace Neaproject.Functions
{
    public static class PasswordHasher
    {
        public static string Hash(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                byte[] passwordBytes =
                    Encoding.UTF8.GetBytes(password);

                byte[] hashBytes =
                    sha256.ComputeHash(passwordBytes);

                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool Verify(string rawPassword, string storedHash)
        {
            string hashedInput =
                Hash(rawPassword);

            return hashedInput == storedHash;
        }
    }
}
