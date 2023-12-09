

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
    }
}