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

    }
}
