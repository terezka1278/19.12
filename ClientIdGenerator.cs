using System;

namespace Neaproject.Functions
{
    public static class ClientIdGenerator
    {
        public static string CreateClientId(
            string firstName,
            string lastName,
            string phoneNum)
        {
            if (string.IsNullOrWhiteSpace(firstName) ||
                string.IsNullOrWhiteSpace(lastName) ||
                string.IsNullOrWhiteSpace(phoneNum) ||
                phoneNum.Length < 3)
            {
                return "UNKNOWN";
            }

            string firstInitial =
                firstName.Substring(0, 1).ToUpper();

            string lastInitial =
                lastName.Substring(0, 1).ToUpper();

            string phoneSuffix =
                phoneNum.Substring(phoneNum.Length - 3);

            return firstInitial + lastInitial + phoneSuffix;
        }
    }
}
