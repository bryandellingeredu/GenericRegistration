
using Application.Registrations;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RegistrationController : BaseApiController
    {
        [HttpPost("getRegistration")]
        public async Task<IActionResult> GetRegistration(GetRegistrationDTO getRegistrationDTO) =>
            HandleResult(await Mediator.Send(new GetRegistration.Command { GetRegistrationDTO = getRegistrationDTO }));

        [HttpPost("createUpdateRegistration")]
        public async Task<IActionResult> CreateUpdateRegistration([FromBody] Registration registration) =>
            HandleResult(await Mediator.Send(new CreateUpdateRegistration.Command { Registration = registration }));
    }
}
