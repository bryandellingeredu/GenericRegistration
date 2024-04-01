using Application.AnswerAttachments;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AnswerAttachmentsController : BaseApiController
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> Details(Guid id) => HandleResult(await Mediator.Send(new List.Query { RegistrationId = id }));
    }
}
