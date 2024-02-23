using Application.CustomQuestions;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CustomQuestionsController : BaseApiController
    {
        [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId) =>
             HandleResult(await Mediator.Send(new Details.Query { RegistrationEventId = registrationEventId }));

        [HttpPost("{registrationEventId}")]
        public async Task<IActionResult> CreateRegistration(Guid registrationEventId, [FromBody] List<CustomQuestion> customQuestions) =>
        HandleResult(await Mediator.Send(new CreateUpdate.Command { RegistrationEventId = registrationEventId, CustomQuestions = customQuestions }));
    }
}
