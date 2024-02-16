using Application.RegistrationEvents;
using Domain;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class RegistrationEventsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult> GetRegistrations() => HandleResult(await Mediator.Send(new List.Query(User.FindFirstValue(ClaimTypes.Email))));


        [HttpGet("{id}")]
        public async Task<ActionResult> GetRegistrationEvent(Guid id) =>
            HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [HttpPost]
        public async Task<IActionResult> CreateRegistration(RegistrationEvent registrationEvent) =>
            HandleResult(await Mediator.Send(
                new CreateUpdate.Command {
                    RegistrationEvent = registrationEvent,
                    Email = User.FindFirstValue(ClaimTypes.Email) }));
    }
}
