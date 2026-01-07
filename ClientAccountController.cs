using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Models;
using Neaproject.DataObjects;
using Neaproject.Functions;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client-account")]
    public class ClientAccountController : ControllerBase
    {
        private readonly ClientDataAccess _clients;

        public ClientAccountController(ClientDataAccess clients)
        {
            _clients = clients;
        }

        [HttpGet("{clientId}")]
        public ActionResult<Client> GetClient(string clientId)
        {
            var clientDetails = _clients.GetClientById(clientId);

            if (clientDetails == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(clientDetails);
        }

        [HttpPut("{clientId}")]
        public IActionResult UpdateClient(
            string clientId,
            [FromBody] ClientUpdate updatedDetails)
        {
            string passwordHash;

            if (string.IsNullOrWhiteSpace(updatedDetails.Password))
            {
                var existingClient =
                    _clients.GetClientById(clientId);

                if (existingClient == null)
                {
                    return NotFound(new { message = "Client not found." });
                }

                passwordHash = existingClient.Password;
            }
            else
            {
                passwordHash =
                    PasswordHasher.Hash(updatedDetails.Password);
            }

            _clients.UpdateClientFields(
                clientId,
                updatedDetails.Email,
                updatedDetails.PhoneNum,
                updatedDetails.Address,
                updatedDetails.Postcode,
                passwordHash
            );

            return Ok(new
            {
                message = "Account updated successfully."
            });
        }
    }
}
