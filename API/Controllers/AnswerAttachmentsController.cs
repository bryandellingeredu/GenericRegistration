using Application.AnswerAttachments;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AnswerAttachmentsController : BaseApiController
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> List(Guid id) => HandleResult(await Mediator.Send(new List.Query { RegistrationId = id }));

        [HttpGet("Details/{id}")]
        public async Task<IActionResult> Details(Guid id) => HandleResult(await Mediator.Send(new Details.Query { Id = id }));

        [HttpGet("GetByRegistrationEvent/{id}")]
        public async Task<IActionResult> GetByRegistrationEvent(Guid id) => HandleResult(await Mediator.Send(new ListByRegistrationEvent.Query { RegistrationEventId = id }));

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id) => HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }
}

