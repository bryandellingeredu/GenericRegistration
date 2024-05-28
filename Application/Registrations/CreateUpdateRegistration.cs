﻿using Application.Core;
using Application.EmailLink;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using Persistence;
using Persistence.Migrations;
using System.Text;


namespace Application.Registrations
{
    public class CreateUpdateRegistration
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationWithHTMLContent Registration { get; set; }
            public string Email  {get; set;}
        }


        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var existingRegistration = await _context.Registrations
                    .Include(x => x.Answers)
                    .Where(x => x.Id == request.Registration.Id).FirstOrDefaultAsync();

                var registrationEvent = await _context.RegistrationEvents
                   .Where(x => x.Id == request.Registration.RegistrationEventId)
                   .AsNoTracking()
                   .FirstAsync();

                if (existingRegistration != null)
                {
                    existingRegistration.FirstName = request.Registration.FirstName;
                    existingRegistration.LastName = request.Registration.LastName;
                    existingRegistration.Phone = request.Registration.Phone;
                    existingRegistration.Email = request.Registration.Email;
                    existingRegistration.Registered = request.Registration.Registered;
                    if(existingRegistration.Answers.Any()) {
                        foreach(var answer in existingRegistration.Answers)
                        {
                            answer.AnswerText = request.Registration.Answers.FirstOrDefault(x => x.Id == answer.Id).AnswerText ?? string.Empty;
                        }
                    }
                    else
                    {
                        existingRegistration.Answers = request.Registration.Answers;
                    }
                    try
                    {
                        await _context.SaveChangesAsync();
                        await SendEmail(request.Registration, "Updated", request.Email);
                        await SendEmailToEventOwner(request.Registration, "Updated");  
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
                    newRegistration.Id = request.Registration.Id;
                    newRegistration.RegistrationEventId = request.Registration.RegistrationEventId;
                    newRegistration.FirstName = request.Registration.FirstName;
                    newRegistration.LastName = request.Registration.LastName;
                    newRegistration.Phone = request.Registration.Phone;
                    newRegistration.Email = request.Registration.Email;
                    newRegistration.UserEmail = request.Email;
                    newRegistration.RegistrationDate = DateTime.UtcNow;
                    newRegistration.Answers = request.Registration.Answers;
                    newRegistration.Registered = registrationEvent.AutoApprove;
                    _context.Registrations.Add(newRegistration);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to create registration");
                    await SendEmail(request.Registration, "New", request.Email);
                    await SendEmailToEventOwner(request.Registration, "New");
                    return Result<Unit>.Success(Unit.Value);
                }
            }

            static bool IsGuid(string input)
            {
                return Guid.TryParse(input, out _);
            }

            private async Task SendEmailToEventOwner(RegistrationWithHTMLContent registration, string status)
            {
                bool hasAttachments = false;
                List<string> emails = new List<string>();

                RegistrationEvent registrationEvent = await _context.RegistrationEvents
                    .Where(x => x.Id == registration.RegistrationEventId)
                    .FirstAsync();

                if (registrationEvent.AutoEmail)
                {
                    emails.Add(registrationEvent.CreatedBy);

                    List<AnswerAttachment> answerAttachments = await _context.AnswerAttachments.AsNoTracking().Where(x => x.RegistrationLookup == registration.Id).ToListAsync();

                    List<RegistrationEventOwner> registrationEventOwners = await _context.RegistrationEventOwners
                        .AsNoTracking()
                        .Where(x => x.RegistrationEventId == registration.RegistrationEventId).ToListAsync();
                    foreach (RegistrationEventOwner owner in registrationEventOwners)
                    {
                        emails.Add(owner.Email);
                    }
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                    List<CustomQuestion> customQuestions = await _context.CustomQuestions.Where(x => x.RegistrationEventId == registration.RegistrationEventId).ToListAsync();
                    string title = $"{registration.FirstName} {registration.LastName}  has {(status == "New" ? "registered" : "updated their registration")} for {registrationEvent.Title}";
                    string body = $"{registration.FirstName} {registration.LastName}  has {(status == "New" ? "registered" : "updated their registration")} for {registrationEvent.Title}";
                    body = body + $"<p><strong>First Name: </strong> {registration.FirstName}</p>";
                    body = body + $"<p><strong>Last Name: </strong> {registration.LastName}</p>";
                    body += $"<p><strong>Email: </strong> <a href='mailto:{registration.Email}'>{registration.Email}</a></p>";
                    foreach (var question in customQuestions.OrderBy(x => x.Index))
                    {
                        if (string.IsNullOrEmpty(question.ParentQuestionOption) || registration.Answers.Any(x => x.AnswerText == question.ParentQuestionOption))
                        {
                            if (question.QuestionType != QuestionType.Attachment)
                            {
                                string answer = registration.Answers.Where(x => x.CustomQuestionId == question.Id).FirstOrDefault().AnswerText ?? string.Empty;
                                if (IsGuid(answer))
                                {
                                    Guid questionOptionId = Guid.Parse(answer);
                                    QuestionOption questionOption = await _context.QuestionOptions.FindAsync(questionOptionId);
                                    answer = questionOption.OptionText;
                                }

                                body = body + $"<p><strong>{question.QuestionText}: </strong> {answer}</p>";
                            }
                            if (question.QuestionType == QuestionType.Attachment)
                            {
                                if (answerAttachments.Any() && answerAttachments.FirstOrDefault(x => x.CustomQuestionLookup == question.Id) != null)
                                {
                                    hasAttachments = true;
                                    body = body + $"<p><strong>{question.QuestionText}: </strong> {answerAttachments.First(x => x.CustomQuestionLookup == question.Id).FileName}</p>";
                                }
                                else
                                {
                                    body = body + $"<p><strong>{question.QuestionText}: </strong></p>";
                                }
                            }
                        }
                    }
                    try
                    {
                        if (hasAttachments)
                        {
                            List<EmailAttachment> emailAttachments = new List<EmailAttachment>();
                            foreach (AnswerAttachment answerAttachment in answerAttachments)
                            {
                                Domain.Attachment attachment = await _context.Attachments.FindAsync(answerAttachment.AttachmentId);
                                byte[] binaryData = attachment.BinaryData;
                                emailAttachments.Add(new EmailAttachment
                                {
                                    Name = answerAttachment.FileName,
                                    ContentType = answerAttachment.FileType,
                                    BinaryData = binaryData
                                });
                            }
                            await GraphHelper.SendEmailWithAttachments(emails.ToArray(), title, body, emailAttachments.ToArray());
                        }
                        else
                        {
                            await GraphHelper.SendEmail(emails.ToArray(), title, body);

                        }

                    }
                    catch (Exception ex)
                    {

                        throw;
                    }
                }
            }


            private async Task SendEmail(RegistrationWithHTMLContent registration, string status, string email    )
            {
                string loginType = email.ToLower().Trim().EndsWith("armywarcollege.edu") ? "EDU" : "CAC";
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                RegistrationEvent registrationEvent = await _context.RegistrationEvents.FindAsync(registration.RegistrationEventId);
                var registrationLinkUrl = $"{settings.BaseUrl}?redirecttopage=registerforevent/{registration.RegistrationEventId}&logintype={loginType}";
                var cancelRegistrationUrl = $"{settings.BaseUrl}?redirecttopage=deregisterforevent/{registration.Id}&logintype={loginType}";
                var documentLibraryLinkUrl = $"{settings.BaseUrl}?redirecttopage=documentlibraryforevent/{registration.RegistrationEventId}&logintype={loginType}";
                string title = $"Thank You for {(status == "New" ? "registering" : "updating your registration")} for {registrationEvent.Title}";
                string body = $"<p>Thank You for {(status == "New" ? "registering" : "updating your registration")} for {registrationEvent.Title}</p>";
                body = body + $"<p>  <strong>Location:</strong> {registrationEvent.Location}</p>";
                body = body + $"<p><strong>Start:</strong> {registrationEvent.StartDate.ToString("MM/dd/yyyy")}</p>";
                body = body + $"<p><strong>End:</strong> {registrationEvent.EndDate.ToString("MM/dd/yyyy")}</p><p></p> ";
                body = body + $"<p> To make changes to your answers you may <a href={registrationLinkUrl}> Update Your Registration </a></p>";
                body = body + $"<p> If you are no longer able to attend you may <a href={cancelRegistrationUrl}> Cancel Your Registration </a></p><p></p> ";
                if (!registrationEvent.AutoApprove && !registration.Registered)
                {
                    body = body + "<p>Your Registration is under review, you will receive an email when you have been approved for this event.</p><p></p>";
                }
                if (registrationEvent.DocumentLibrary && (registrationEvent.AutoApprove || registration.Registered))
                {
                    body = body + $"<p>Please visit the <a href={documentLibraryLinkUrl}> Document Library </a> before the event to review documents related to the event.</p>";
                }
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
