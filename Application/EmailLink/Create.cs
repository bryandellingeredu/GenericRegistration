using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class Create
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EmailLinkDTO EmailLinkDTO{ get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(IConfiguration config, DataContext context, EncryptionHelper encryptionHelper)
            {
                _config = config;
                _context = context;
                _encryptionHelper = encryptionHelper;   
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {

                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                var randomKey = GenerateRandomKey();
                var registrationLink = new RegistrationLink
                {
                    Email = request.EmailLinkDTO.Email,
                    RegistrationEventId = request.EmailLinkDTO.RegistrationEventId,
                    RandomKey = randomKey,
                    CreatedAt = DateTime.UtcNow
                };
                _context.RegistrationLinks.Add(registrationLink);

                // Save changes asynchronously
                var result = await _context.SaveChangesAsync() > 0;

                var registrationEvent = await _context.RegistrationEvents
                    .AsNoTracking()
                    .Where(re => re.Id == request.EmailLinkDTO.RegistrationEventId)
                    .FirstOrDefaultAsync();

                var encryptedKeyBytes = _encryptionHelper.EncryptStringToBytes_Aes(randomKey);
                var encryptedKey = Convert.ToBase64String(encryptedKeyBytes);
                var urlEncodedEncryptedKey = Uri.EscapeDataString(encryptedKey);
                var registrationLinkUrl = $"{settings.BaseUrl}/registerfromlink?key={urlEncodedEncryptedKey}";

                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                string title = $"Register for {registrationEvent.Title}";
                string body = $"Please complete your registration  by clicking on the link: <a href=\"{registrationLinkUrl}\">Register for {registrationEvent.Title}</a>";
                try
                {
                    await GraphHelper.SendEmail(new[] { request.EmailLinkDTO.Email }, title, body);
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"An Error Occured Seding the Link: {ex.Message}");
                }
            }

            private string GenerateRandomKey()
            {
                var randomBytes = new byte[32]; 
                RandomNumberGenerator.Fill(randomBytes);
                return Convert.ToBase64String(randomBytes); 
            }

        }
    }
}
