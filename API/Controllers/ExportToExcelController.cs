using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text;

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


            RegistrationEvent registrationEvent =  _context.RegistrationEvents
            .Where(x => x.Id == id)
            .AsNoTracking()
            .FirstOrDefault();

            if (registrationEvent == null)
            {
                throw new Exception("registration event not found");
            }

            var customQuestions = _context.CustomQuestions
                .Where(c => c.RegistrationEventId == registrationEvent.Id)
                .Include(c => c.Options)
                .AsNoTracking()
                .ToList();

            var registrations = _context.Registrations
            .Where(r => r.RegistrationEventId == registrationEvent.Id)
            .Include(r => r.Answers)
            .AsNoTracking()
            .ToList();

            registrationEvent.CustomQuestions = customQuestions;
            registrationEvent.Registrations = registrations;

            List<QuestionOption> options = new List<QuestionOption>();

            foreach (var question in registrationEvent.CustomQuestions)
            {
                foreach (var option in question.Options)
                {
                    options.Add(option);
                }
            }



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
                    var answer = GetAnswer(question.Id, registration.Answers, question.QuestionType, answerAttachments, registration.Id, options);
                    line += $",\"{answer.Replace("\"", "\"\"")}\""; 
                }
                builder.AppendLine(line);
            }

            return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "registrations.csv");
        }

        private string GetAnswer(Guid questionId, IEnumerable<Answer> answers, QuestionType questionType, List<AnswerAttachment> answerAttachments, Guid id, List<QuestionOption> options)
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
                string answerText =  answer?.AnswerText ?? string.Empty;
                if (IsGuid(answerText))
                {
                    Guid questionOptionId = Guid.Parse(answerText);
                    QuestionOption questionOption = options.Find(x => x.Id == questionOptionId);
                    answerText = questionOption.OptionText;
                }
                return answerText?.Replace("\r\n", " ").Replace("\n", " ").Replace("\r", " ") ?? string.Empty;
            }
 
        }

        static bool IsGuid(string input)
        {
            return Guid.TryParse(input, out _);
        }
    }
}
