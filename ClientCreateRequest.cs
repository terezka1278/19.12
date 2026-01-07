using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class ClientCreateRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PhoneNum { get; set; }
        public required string Address { get; set; }
        public required string Postcode { get; set; }
        public required string Password { get; set; }
    }
}
