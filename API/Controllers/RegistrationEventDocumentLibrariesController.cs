using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.RegistrationEventDocumentLibraries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class RegistrationEventDocumentLibrariesController : BaseApiController
    {
         [AllowAnonymous]
         [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId) =>
            HandleResult(await Mediator.Send(new Details.Query { RegistrationEventId = registrationEventId }));
        
        [HttpPost]
        public async Task<IActionResult> CreateRegistration(RegistrationEventDocumentLibrary registrationEventDocumentLibrary) =>
           HandleResult(await Mediator.Send(new CreateUpdate.Command{RegistrationEventDocumentLibrary = registrationEventDocumentLibrary}));
    }
}