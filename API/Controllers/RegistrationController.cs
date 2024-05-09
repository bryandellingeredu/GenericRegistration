

using Application.Registrations;
using Microsoft.AspNetCore.Authorization;
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id) => HandleResult(await Mediator.Send(new Delete.Command { Id = id }));

        [HttpPost("GetByRegistrationId/{id}")]
        public async Task<IActionResult> List(Guid id) => HandleResult(await Mediator.Send(new List.Query { Id = id }));

        [HttpGet("{id}")]
        public async Task<IActionResult> Details(Guid id) => HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [AllowAnonymous]
        [HttpPost("CountRegisteredUsers/{id}")]
        public async Task<IActionResult> CountRegisteredUsers(Guid id) => HandleResult((await Mediator.Send(new CountRegisteredUsers.Query { RegistrationEventId = id })));

        [HttpPut("changeRegistered/{id}")]
        public async Task<IActionResult> ChangeRegistered(Guid id, RegisteredDTO registeredDTO) =>
            HandleResult(await Mediator.Send(new ChangeRegistered.Command { Id = id, RegisteredDTO = registeredDTO }));
    }
}
