using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;

namespace Application.EmailLink
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public ValidateDTO ValidateDTO { get; set; }
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

                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.AsNoTracking().Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
                var registration = await _context.Registrations
                                   .Where(x => x.RegistrationEventId == registrationLink.RegistrationEventId)
                                   .Where(x => x.Email == registrationLink.Email)   
                                   .FirstOrDefaultAsync();
                var registrationEvent = await _context.RegistrationEvents.AsNoTracking().FirstAsync(x => x.Id == registration.RegistrationEventId);

                List<string> emails = new List<string>();
                emails.Add(registrationEvent.CreatedBy);
                List<RegistrationEventOwner> registrationEventOwners = await _context.RegistrationEventOwners
                .AsNoTracking()
                .Where(x => x.RegistrationEventId == registration.RegistrationEventId).ToListAsync();
                foreach (RegistrationEventOwner owner in registrationEventOwners)
                {
                    emails.Add(owner.Email);
                }

                string title = $"{registration.FirstName} {registration.LastName} has cancelled registration for {registrationEvent.Title}";
                string body = $"{registration.FirstName} {registration.LastName} has cancelled registration for {registrationEvent.Title}";
                body = body + $"<p><strong>First Name: </strong> {registration.FirstName}</p>";
                body = body + $"<p><strong>Last Name: </strong> {registration.LastName}</p>";
                body += $"<p><strong>Email: </strong> <a href='mailto:{registration.Email}'>{registration.Email}</a></p>";

                var registrationLinks = await _context.RegistrationLinks
                    .Where(x => x.Email == registration.Email)
                    .Where(x => x.RegistrationEventId == registration.RegistrationEventId)
                    .ToListAsync();

                _context.Remove(registration);
                _context.RemoveRange(registrationLinks);

                var result = await _context.SaveChangesAsync() > 0;


                if (!result) return Result<Unit>.Failure("Failed to delete the registration");

                await SendEmailToEventOwner(title, body, emails);

                return Result<Unit>.Success(Unit.Value);

            }
            private async Task SendEmailToEventOwner(string title, string body, List<string> emails)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                await GraphHelper.SendEmail(emails.ToArray(), title, body);
            }
        }
    }
}

