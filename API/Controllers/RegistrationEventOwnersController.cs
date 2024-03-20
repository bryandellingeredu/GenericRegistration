
using Application.RegistrationEventOwners;
using Domain;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class RegistrationEventOwnersController : BaseApiController
    {
        [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId) =>
            HandleResult(await Mediator.Send(new List.Query { RegistrationEventId = registrationEventId }));

        [HttpPost("{registrationEventId}")]
        public async Task<IActionResult> CreateUpdate(Guid registrationEventId, [FromBody] List<RegistrationEventOwner> registrationEventOwners) =>
            HandleResult(await Mediator.Send(new CreateUpdate.Command { RegistrationEventOwners = registrationEventOwners, RegistrationEventId = registrationEventId }));
    }
}
