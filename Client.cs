namespace Neaproject.Models
{
    public class Client
    {
        public string ClientID { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNum { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Postcode { get; set; }
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
