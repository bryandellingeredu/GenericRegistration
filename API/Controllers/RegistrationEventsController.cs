using Application.RegistrationEvents;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Migrations;
using System.Security.Claims;

namespace API.Controllers
{
    public class RegistrationEventsController : BaseApiController
    {

        [HttpGet]
        public async Task<ActionResult> GetRegistrations() => HandleResult(await Mediator.Send(new List.Query(User.FindFirstValue(ClaimTypes.Email))));

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetRegistrationEvent(Guid id) =>
            HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [HttpPost]
        public async Task<IActionResult> CreateRegistration(RegistrationEvent registrationEvent) =>
            HandleResult(await Mediator.Send(
                new CreateUpdate.Command {
                    RegistrationEvent = registrationEvent,
                    Email = User.FindFirstValue(ClaimTypes.Email) }));

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(Guid id) => HandleResult(await Mediator.Send(new Delete.Command { Id = id }));

        [HttpPut("publish/{id}")]
        public async Task<IActionResult> PublishRegistration(Guid id) => HandleResult(await Mediator.Send(new Publish.Command { Id = id }));

        [HttpPut("unpublish/{id}")]
        public async Task<IActionResult> UnPublishRegistration(Guid id) => HandleResult(await Mediator.Send(new UnPublish.Command { Id = id }));



    }
}
