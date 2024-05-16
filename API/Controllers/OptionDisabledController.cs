using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OptionDisabledController : ControllerBase
    {
        private readonly DataContext _context;

        public OptionDisabledController(DataContext context) => _context = context;

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<bool>> IsDisabled(Guid id)
        {
            var queryResult = await _context.QuestionOptions
                .Where(qo => qo.Id == id)
                .Select(qo => new
                {
                    qo.OptionQuota,
                    AnswerCount = _context.Answers
                        .Count(a => a.CustomQuestionId == qo.CustomQuestionId && a.AnswerText == qo.OptionText)
                })
                .FirstOrDefaultAsync();

            if (queryResult == null || string.IsNullOrEmpty(queryResult.OptionQuota) || !int.TryParse(queryResult.OptionQuota, out int quota))
            {
                return Ok(false);
            }

            return Ok(queryResult.AnswerCount >= quota);
        }
    }
}
