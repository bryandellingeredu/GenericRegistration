
using Application.Registrations;
using Domain;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class RegistrationController : BaseApiController
    {
        [HttpPost("getRegistration")]
        public async Task<IActionResult> GetRegistration(GetRegistrationDTO getRegistrationDTO) =>
            HandleResult(await Mediator.Send(
                new GetRegistration.Command { GetRegistrationDTO = getRegistrationDTO, Email = User.FindFirstValue(ClaimTypes.Email) }));

        [HttpPost("createUpdateRegistration")]
        public async Task<IActionResult> CreateUpdateRegistration([FromBody] RegistrationWithHTMLContent registration) =>
            HandleResult(await Mediator.Send(
                new CreateUpdateRegistration.Command { Registration = registration, Email = User.FindFirstValue(ClaimTypes.Email) }));
    }
}
