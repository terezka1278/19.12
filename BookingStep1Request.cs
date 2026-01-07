using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class BookingStep1Request
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PhoneNum { get; set; }
        public required string Address { get; set; }
        public required string Postcode { get; set; }
        public required string Service { get; set; }
        public required string Summary { get; set; }
        public required int Points { get; set; }
        public string? ClientId { get; set; }
    }
}