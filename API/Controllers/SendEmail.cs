
using Application.SendEmail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class SendEmail : BaseApiController
    {
        private readonly IConfiguration _configuration;

        public SendEmail(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> EmailLink([FromBody] EmailRequestDTO emailRequestDTO, [FromHeader(Name = "X-API-KEY")] string apiKey)
        {
            var configuredApiKey = _configuration["SecuritySettings:ApiKey"];
            if (string.IsNullOrEmpty(apiKey) || apiKey != configuredApiKey)
            {
                return Unauthorized("Invalid API Key.");
            }

            return HandleResult(await Mediator.Send(new Create.Command { EmailRequestDTO = emailRequestDTO }));
        }
    }
}
