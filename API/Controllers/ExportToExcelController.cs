using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class ExportToExcelController : BaseApiController
    {
        private readonly DataContext _context;

        public ExportToExcelController(DataContext context) => _context = context;

        [AllowAnonymous]
        [HttpPost("{id}")]
        public IActionResult Csv(Guid id)
        {
            var builder = new StringBuilder();
            builder.Append(Encoding.UTF8.GetString(Encoding.UTF8.GetPreamble()));

            var registrationEvent =  _context.RegistrationEvents
                .Include(x => x.CustomQuestions)
                .Include(x => x.Registrations)
                    .ThenInclude(x => x.Answers)
                .FirstOrDefault(x => x.Id == id);



            if (registrationEvent == null)
            {
                return NotFound();
            }

            var answerAttachments = _context.AnswerAttachments
                   .Where(aa => _context.Registrations
                           .Where(r => r.RegistrationEventId == id)
                           .Select(r => r.Id)
                   .Contains(aa.RegistrationLookup))
                   .ToList();

            var header = "First Name, Last Name, Email";
            foreach (var question in registrationEvent.CustomQuestions.OrderBy(x => x.Index))
            {
                header += $",\"{question.QuestionText.Replace("\"", "\"\"")}\""; 
            }
            builder.AppendLine(header);

            foreach (var registration in registrationEvent.Registrations.OrderBy(x => x.LastName))
            {
                var line = $"\"{registration.FirstName}\",\"{registration.LastName}\",\"{registration.Email}\"";
                foreach (var question in registrationEvent.CustomQuestions.OrderBy(x => x.Index))
                {
                    var answer = GetAnswer(question.Id, registration.Answers, question.QuestionType, answerAttachments, registration.Id);
                    line += $",\"{answer.Replace("\"", "\"\"")}\""; 
                }
                builder.AppendLine(line);
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "registrations.csv");
        }

        private string GetAnswer(Guid questionId, IEnumerable<Answer> answers, QuestionType questionType, List<AnswerAttachment> answerAttachments, Guid id)
        {
            if(questionType == QuestionType.Attachment)
            {
                if (!answerAttachments.Any()) return string.Empty;

                AnswerAttachment answerAttachment = answerAttachments
                    .Where(x => x.CustomQuestionLookup == questionId)
                    .Where(x => x.RegistrationLookup == id)
                    .FirstOrDefault();

                if (answerAttachment != null) return answerAttachment.FileName.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ");
                return string.Empty;    

            }
            else
            {
                var answer = answers.FirstOrDefault(x => x.CustomQuestionId == questionId);
                return answer?.AnswerText.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ") ?? string.Empty;
            }
 
        }
    }
}
