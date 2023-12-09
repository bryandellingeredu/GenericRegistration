

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
        public async Task<ActionResult<List<Registration>>> GetRegistrations(){
            return await Mediator.Send(new List.Query());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Registration>> GetRegistration(Guid id){
            return await Mediator.Send(new Details.Query{ Id = id});
        }

        [HttpPost]
        public async Task<IActionResult> CreateRegistration(Registration registration)
        {
            await Mediator.Send(new Create.Command { Registration = registration });
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditRegistration(Guid id, Registration registration)
        {
            registration.Id = id;
            await Mediator.Send(new Edit.Command { Registration = registration });
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(Guid id)
        {
            await Mediator.Send(new Delete.Command { Id = id });
            return Ok();
        }
    }
}