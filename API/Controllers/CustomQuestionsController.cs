using Application.CustomQuestions;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CustomQuestionsController : BaseApiController
    {
        [HttpGet("{registrationEventId}")]
        public async Task<ActionResult> GetRegistration(Guid registrationEventId)
        {
            try
            {
                var result = await Mediator.Send(new Details.Query { RegistrationEventId = registrationEventId });
                return HandleResult(result);
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        [HttpPost("{registrationEventId}")]
        public async Task<IActionResult> CreateRegistration(Guid registrationEventId, [FromBody] List<CustomQuestion> customQuestions)
        {
            try
            {
                var result = await Mediator.Send(new CreateUpdate.Command { RegistrationEventId = registrationEventId, CustomQuestions = customQuestions });
                return HandleResult(result);
            }
            catch (Exception ex)
            {

                throw;
            }
          
        }

    }
}
