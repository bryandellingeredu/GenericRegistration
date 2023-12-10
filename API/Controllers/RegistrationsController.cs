

using Application.Registrations;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class RegistrationsController : BaseApiController
    {


        [HttpGet]
        public async Task<ActionResult> GetRegistrations() => HandleResult(await Mediator.Send(new List.Query()));


        [HttpGet("{id}")]
        public async Task<ActionResult> GetRegistration(Guid id) => HandleResult(await Mediator.Send(new Details.Query { Id = id }));


        [HttpPost]
        public async Task<IActionResult> CreateRegistration(Registration registration) => HandleResult(await Mediator.Send(new Create.Command { Registration = registration }));


        [HttpPut("{id}")]
        public async Task<IActionResult> EditRegistration(Guid id, Registration registration)
        {
            registration.Id = id;
            return HandleResult(await Mediator.Send(new Edit.Command { Registration = registration }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(Guid id) => HandleResult(await Mediator.Send(new Delete.Command { Id = id }));

    }
}