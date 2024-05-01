using Application.Core;
using Application.EmailLink;
using Azure.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using Persistence;
using Persistence.Migrations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class ChangeRegistered
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegisteredDTO RegisteredDTO { get; set; }
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly EncryptionHelper _encryptionHelper;

            public Handler(DataContext context, IConfiguration config, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _config = config;
                _encryptionHelper = encryptionHelper;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
               var registration = await _context.Registrations.FindAsync(request.Id, cancellationToken);
               registration.Registered = request.RegisteredDTO.Registered;
                try
                {
                    await _context.SaveChangesAsync();
                    if (request.RegisteredDTO.Registered) await sendEmail(registration);
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"An error occurred when trying to update the registration: {ex.Message}");
                }

            }

            private async Task sendEmail(Registration registration)
            {
                //check if the registration is from a link or a logged in user.
             

                List<RegistrationLink> links = await _context.RegistrationLinks
                    .Where(x => x.RegistrationEventId == registration.RegistrationEventId)
                    .Where(x => x.Email == registration.Email)
                    .AsNoTracking()
                    .ToListAsync();

                RegistrationEvent registrationEvent = await _context.RegistrationEvents.FindAsync(registration.RegistrationEventId);

                string title = $"Your registration for {registrationEvent.Title} has been approved";
                string body  = $"Congragulations! Your registration for {registrationEvent.Title} has been approved";
                body = body + $"<p>  <strong>Location:</strong> {registrationEvent.Location}</p>";
                body = body + $"<p><strong>Start:</strong> {registrationEvent.StartDate.ToString("MM/dd/yyyy")}</p>";
                body = body + $"<p><strong>End:</strong> {registrationEvent.EndDate.ToString("MM/dd/yyyy")}</p><p></p> ";


                bool emailUser = links.Any();

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                if (emailUser)
                {
                    
                    var randomKey = GenerateRandomKey();
                    var registrationLink = new RegistrationLink
                    {
                        Email = registration.Email,
                        RegistrationEventId = registration.RegistrationEventId,
                        RandomKey = randomKey,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.RegistrationLinks.Add(registrationLink);
                    await _context.SaveChangesAsync();
                    var encryptedKeyBytes = _encryptionHelper.EncryptStringToBytes_Aes(randomKey);
                    var encryptedKey = Convert.ToBase64String(encryptedKeyBytes);
                    var urlEncodedEncryptedKey = Uri.EscapeDataString(encryptedKey);
                    var registrationLinkUrl = $"{settings.BaseUrl}/registerfromlink?key={urlEncodedEncryptedKey}";
                    var documentLibraryLinkUrl = $"{settings.BaseUrl}/documentlibraryfromlink?key={urlEncodedEncryptedKey}";

                    body = body + $"<p></p><p> To view, or make changes to your registration go to <a href=\"{registrationLinkUrl}\"> {registrationEvent.Title}</a> </p>";

                    if (registrationEvent.DocumentLibrary)
                    {
                        body = body + $"<p>Please visit the <a href={documentLibraryLinkUrl}> Document Library </a> before the event to review documents related to the event.</p>";
                    }

                    var icalContent = CreateICalContent(registrationEvent);
                    var icalFileName = "event_invite.ics";

                    await GraphHelper.SendEmail(new[] { registration.Email }, title, body, icalContent, icalFileName);

                }
                else
                {
                    string loginType = registration.UserEmail.ToLower().Trim().EndsWith("armywarcollege.edu") ? "EDU" : "CAC";
                    var registrationLinkUrl = $"{settings.BaseUrl}?redirecttopage=registerforevent/{registration.RegistrationEventId}&logintype={loginType}";
                    var cancelRegistrationUrl = $"{settings.BaseUrl}?redirecttopage=deregisterforevent/{registration.Id}&logintype={loginType}";
                    var documentLibraryLinkUrl = $"{settings.BaseUrl}?redirecttopage=documentlibraryforevent/{registration.RegistrationEventId}&logintype={loginType}";
                    body = body + $"<p></p><p> To view, or make changes to your registration go to <a href={registrationLinkUrl}> Update Your Registration </a></p>";
                    body = body + $"<p> If you are no longer able to attend you may <a href={cancelRegistrationUrl}> Cancel Your Registration </a></p> ";
                    if (registrationEvent.DocumentLibrary)
                    {
                        body = body + $"<p>Please visit the <a href={documentLibraryLinkUrl}> Document Library </a> before the event to review documents related to the event.</p>";
                    }
                    var icalContent = CreateICalContent(registrationEvent);
                    var icalFileName = "event_invite.ics";
                    await GraphHelper.SendEmail(new[] { registration.Email }, title, body, icalContent, icalFileName);
                }

            }

            private string GenerateRandomKey()
            {
                var randomBytes = new byte[32];
                RandomNumberGenerator.Fill(randomBytes);
                return Convert.ToBase64String(randomBytes);
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
