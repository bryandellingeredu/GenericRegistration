using Application.Core;
using Application.Registrations;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using Persistence;
using System.Text;


namespace Application.EmailLink
{
    public class CreateUpdateRegistration
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationDTO RegistrationDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            private readonly IConfiguration _config;
            public Handler(DataContext context, EncryptionHelper encryptionHelper, IConfiguration config)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.RegistrationDTO.DecodedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
                if (registrationLink != null)
                {
                    var existingRegistration =await _context.Registrations
                        .Include(x => x.Answers)
                        .Where(x => x.Id == request.RegistrationDTO.Id)
                        .FirstOrDefaultAsync();

                    if (existingRegistration != null) {
                        existingRegistration.FirstName = request.RegistrationDTO.FirstName; 
                        existingRegistration.LastName = request.RegistrationDTO.LastName;
                        existingRegistration.Phone = request.RegistrationDTO.Phone;
                        existingRegistration.Email = request.RegistrationDTO.Email;
                        if (existingRegistration.Answers.Any())
                        {
                            foreach (var answer in existingRegistration.Answers)
                            {
                                answer.AnswerText = request.RegistrationDTO.Answers.FirstOrDefault(x => x.Id == answer.Id).AnswerText ?? string.Empty;
                            }
                        }
                        else
                        {
                            existingRegistration.Answers = request.RegistrationDTO.Answers;
                        }
                        try
                        {
                            await _context.SaveChangesAsync();
                            await SendEmail(request.RegistrationDTO, "Updated", request.RegistrationDTO.DecodedKey);
                            await SendEmailToEventOwner(request.RegistrationDTO, "Updated");
                            return Result<Unit>.Success(Unit.Value);
                        }
                        catch (Exception ex)
                        {

                            return Result<Unit>.Failure($"An error occurred when trying to update the registration: {ex.Message}");
                        }
                    }
                    else
                    {
                        Registration newRegistration = new Registration();
                        newRegistration.Id = request.RegistrationDTO.Id;
                        newRegistration.RegistrationEventId = request.RegistrationDTO.RegistrationEventId;
                        newRegistration.FirstName = request.RegistrationDTO.FirstName;
                        newRegistration.LastName = request.RegistrationDTO.LastName;
                        newRegistration.Phone = request.RegistrationDTO.Phone;
                        newRegistration.Email = request.RegistrationDTO.Email;
                        newRegistration.RegistrationDate = DateTime.UtcNow;
                        newRegistration.Registered = true;
                        newRegistration.Answers = request.RegistrationDTO.Answers;
                        _context.Registrations.Add(newRegistration);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create registration");
                        await SendEmail(request.RegistrationDTO, "New", request.RegistrationDTO.DecodedKey);
                        await SendEmailToEventOwner(request.RegistrationDTO, "New");
                        return Result<Unit>.Success(Unit.Value);
                    }

                }
                return Result<Unit>.Failure($"invalid registration link");
            
               
            }

            private async Task SendEmailToEventOwner(RegistrationDTO registration, string status)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                RegistrationEvent registrationEvent = await _context.RegistrationEvents.FindAsync(registration.RegistrationEventId);
                List<CustomQuestion> customQuestions = await _context.CustomQuestions.Where(x => x.RegistrationEventId == registration.RegistrationEventId).ToListAsync();
                string title = $"{registration.FirstName} {registration.LastName} has {(status == "New" ? "registered" : "updated their registration")} for {registrationEvent.Title}";
                string body = $"{registration.FirstName} {registration.LastName} has {(status == "New" ? "registered" : "updated their registration")} for {registrationEvent.Title}";
                body = body + $"<p><strong>First Name: </strong> {registration.FirstName}</p>";
                body = body + $"<p><strong>Last Name: </strong> {registration.LastName}</p>";
                body += $"<p><strong>Email: </strong> <a href='mailto:{registration.Email}'>{registration.Email}</a></p>";
                body += $"<p><strong>Phone: </strong> <a href='tel:{registration.Phone}'>{registration.Phone}</a></p>";
                foreach (var question in customQuestions)
                {
                    body = body + $"<p><strong>{question.QuestionText}: </strong> {registration.Answers.Where(x => x.CustomQuestionId == question.Id).FirstOrDefault().AnswerText ?? string.Empty}</p>";
                }
                try
                {
                    await GraphHelper.SendEmail(new[] { registrationEvent.CreatedBy }, title, body);
                }
                catch (Exception ex)
                {

                    throw;
                }
            }
            private async Task SendEmail(RegistrationDTO registration, string status, string encryptedKey)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                RegistrationEvent registrationEvent = await _context.RegistrationEvents.FindAsync(registration.RegistrationEventId);
                var urlEncodedEncryptedKey = Uri.EscapeDataString(encryptedKey);
                var registrationLinkUrl = $"{settings.BaseUrl}/registerfromlink?key={urlEncodedEncryptedKey}";
                var cancelRegistrationUrl = $"{settings.BaseUrl}/deregisterforeventfromlink/{urlEncodedEncryptedKey}";
                string title = $"Thank you for {(status == "New" ? "registering" : "updating your registration")} for {registrationEvent.Title}";
                string body = $"<p>Thank You for Registering for {registrationEvent.Title}</p>";
                body = body + $"<p>  <strong>Location:</strong> {registrationEvent.Location}</p>";
                body = body + $"<p><strong>Start:</strong> {registrationEvent.StartDate.ToString("MM/dd/yyyy")}</p>";
                body = body + $"<p><strong>End:</strong> {registrationEvent.EndDate.ToString("MM/dd/yyyy")}</p><p></p> ";
                body = body + $"<p> To make changes to your answers you may <a href={registrationLinkUrl}> Update Your Registration </a></p>";
                body = body + $"<p> If you are no longer able to attend you may <a href={cancelRegistrationUrl}> Cancel Your Registration </a></p><p></p> ";
                body = body + registration.Hcontent;
                var icalContent = CreateICalContent(registrationEvent);
                var icalFileName = "event_invite.ics";
                try
                {
                    await GraphHelper.SendEmail(new[] { registration.Email }, title, body, icalContent, icalFileName);
                }
                catch (Exception ex)
                {

                    throw;
                }
            }
            private string CreateICalContent(RegistrationEvent registrationEvent)
            {
                var sb = new StringBuilder();

                sb.AppendLine("BEGIN:VCALENDAR");
                sb.AppendLine("VERSION:2.0");
                sb.AppendLine("PRODID:-//hacksw/handcal//NONSGML v1.0//EN");
                sb.AppendLine("BEGIN:VTIMEZONE");
                sb.AppendLine("TZID:America/New_York");
                sb.AppendLine("BEGIN:STANDARD");
                sb.AppendLine("DTSTART:20201101T020000");
                sb.AppendLine("RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU");
                sb.AppendLine("TZOFFSETFROM:-0400");
                sb.AppendLine("TZOFFSETTO:-0500");
                sb.AppendLine("TZNAME:EST");
                sb.AppendLine("END:STANDARD");
                sb.AppendLine("BEGIN:DAYLIGHT");
                sb.AppendLine("DTSTART:20200308T020000");
                sb.AppendLine("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
                sb.AppendLine("TZOFFSETFROM:-0500");
                sb.AppendLine("TZOFFSETTO:-0400");
                sb.AppendLine("TZNAME:EDT");
                sb.AppendLine("END:DAYLIGHT");
                sb.AppendLine("END:VTIMEZONE");
                sb.AppendLine("BEGIN:VEVENT");
                sb.AppendLine($"UID:{Guid.NewGuid()}");
                sb.AppendLine($"DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}");
                sb.AppendLine($"DTSTART;VALUE=DATE:{registrationEvent.StartDate:yyyyMMdd}");
                sb.AppendLine($"DTEND;VALUE=DATE:{registrationEvent.EndDate.AddDays(1):yyyyMMdd}");
                sb.AppendLine($"SUMMARY:{registrationEvent.Title}");
                sb.AppendLine($"LOCATION:{registrationEvent.Location}");
                sb.AppendLine("END:VEVENT");
                sb.AppendLine("END:VCALENDAR");

                return sb.ToString();
            }
        }
    }
}
