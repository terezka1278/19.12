using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.DataObjects;
using Neaproject.Models;
using Neaproject.Functions;
using System;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client")]
    public class ClientController : ControllerBase
    {
        private readonly ClientDataAccess _clients;

        public ClientController(ClientDataAccess clients)
        {
            _clients = clients;
        }

        [HttpPost("create-account")]
        public IActionResult CreateAccount(
            [FromBody] ClientCreateRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "No data sent." });
            }

            string email =
                request.Email.Trim();

            string phoneNumber =
                request.PhoneNum.Trim();

            if (_clients.EmailExists(email))
            {
                return BadRequest(new
                {
                    message = "Email already in use."
                });
            }

            if (_clients.PhoneExists(phoneNumber))
            {
                return BadRequest(new
                {
                    message = "Phone number already in use."
                });
            }

            string clientId =
                ClientIdGenerator.CreateClientId(
                    request.FirstName,
                    request.LastName,
                    request.PhoneNum
                );

            var newClient = new Client
            {
                ClientID = clientId,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                PhoneNum = phoneNumber,
                Address = request.Address?.Trim(),
                Postcode = request.Postcode?.Trim(),
                Password = PasswordHasher.Hash(request.Password),
                Role = "C"
            };

            try
            {
                _clients.CreateClient(newClient);
            }
            catch (Exception exception)
            {
                return BadRequest(new
                {
                    message = exception.Message
                });
            }

            return Ok(new
            {
                message = "Account created",
                clientId = clientId
            });
        }

        [HttpPost("login")]
        public IActionResult Login(
            [FromBody] LoginRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "No data sent."
                });
            }

            var existingUser =
                _clients.GetUserByEmail(
                    request.Email.Trim()
                );

            if (existingUser == null)
            {
                return BadRequest(new
                {
                    message = "Account not found."
                });
            }

            bool passwordValid =
                PasswordHasher.Verify(
                    request.Password,
                    existingUser.Password
                );

            if (!passwordValid)
            {
                return BadRequest(new
                {
                    message = "Incorrect password."
                });
            }

            return Ok(new
            {
                message = "Login successful",
                clientId = existingUser.Id,
                role = existingUser.Role
            });
        }

        //[HttpGet("hash-test")]
        //public IActionResult HashTest()
        //{return Ok(PasswordHasher.Hash("Business123"));}

    }
}
