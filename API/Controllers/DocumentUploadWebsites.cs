using Application.DocumentUploadWebsites;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DocumentUploadWebsitesController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId) =>
            HandleResult(await Mediator.Send(new Details.Query { RegistrationEventId = registrationEventId }));

        [HttpPost]
        public async Task<IActionResult> CreateRegistration(DocumentUploadWebsite documentUploadWebsite) =>
           HandleResult(await Mediator.Send(new CreateUpdate.Command{ DocumentUploadWebsite = documentUploadWebsite }));
    }
}

