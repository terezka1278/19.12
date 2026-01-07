using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
