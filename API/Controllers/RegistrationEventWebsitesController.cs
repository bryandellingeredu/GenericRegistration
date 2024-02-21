using Application.RegistrationEventWebsites;
using Domain;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class RegistrationEventWebsitesController : BaseApiController
    {
        [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId) =>
            HandleResult(await Mediator.Send(new Details.Query { RegistrationEventId = registrationEventId }));

        [HttpPost]
        public async Task<IActionResult> CreateRegistration(RegistrationEventWebsite registrationEventWebsite) =>
           HandleResult(await Mediator.Send(new CreateUpdate.Command{RegistrationEventWebsite = registrationEventWebsite}));
    }
}

