using Application.EmailLink;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class EmailLinkController :  BaseApiController
    {
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> EmailLink([FromBody] EmailLinkDTO emailLinkDTO) =>
            HandleResult(await Mediator.Send(new Create.Command { EmailLinkDTO = emailLinkDTO }));

        [AllowAnonymous]
        [HttpPost("ForDocumentLibrary")]
        public async Task<IActionResult> EmailLinkForDocumentLibrary([FromBody] EmailLinkDTO emailLinkDTO) =>
    HandleResult(await Mediator.Send(new CreateForDocumentLibrary.Command { EmailLinkDTO = emailLinkDTO }));

        [AllowAnonymous]
        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new Validate.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getRegistrationEvent")]
        public async Task<IActionResult> GetRegistrationEvent([FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new GetRegistrationEvent.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getRegistrationLink")]
         public async Task<IActionResult> GetRegistrationLink([FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new GetRegistrationLink.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getRegistration")]
        public async Task<IActionResult> GetRegistration([FromBody] ValidateDTO validateDTO) =>
          HandleResult(await Mediator.Send(new GetRegistration.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getRegistrations/{id}")]
        public async Task<IActionResult> GetRegistrations(Guid id, [FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new GetRegistrations.Command { RegistrationEventId = id, ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getAnswerAttachments")]
        public async Task<IActionResult> GetAnswerAttachments([FromBody] ValidateDTO validateDTO) =>
         HandleResult(await Mediator.Send(new GetAnswerAttachments.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("getAnswerAttachment/{id}")]
        public async Task<IActionResult> GetAnswerAttachment(Guid id, [FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new GetAnswerAttachment.Command { AnswerAttachmentId = id, ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("createUpdateRegistration")]
        public async Task<IActionResult> CreateUpdateRegistration([FromBody] RegistrationDTO registrationDTO) =>
        HandleResult(await Mediator.Send(new CreateUpdateRegistration.Command { RegistrationDTO = registrationDTO }));

        [AllowAnonymous]
        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] ValidateDTO validateDTO) =>
            HandleResult(await Mediator.Send(new Delete.Command { ValidateDTO = validateDTO }));

        [AllowAnonymous]
        [HttpPost("deleteAnswerAttachment/{id}")]
        public async Task<IActionResult> DeleteAnswerAttachment(Guid id, [FromBody] ValidateDTO validateDTO) =>
          HandleResult(await Mediator.Send(new DeleteAnswerAttachment.Command {AnswerAttachmentId = id, ValidateDTO = validateDTO }));

    }
}
