using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class GetRegistrationEvent
    {
        public class Command : IRequest<Result<RegistrationEvent>>
        {
            public ValidateDTO ValidateDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<RegistrationEvent>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler( DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<RegistrationEvent>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync(); 
                if (registrationLink != null) {
                    var registrationEvent = await _context.RegistrationEvents.FirstOrDefaultAsync(x => x.Id == registrationLink.RegistrationEventId);
                    if (registrationEvent != null) {
                        return Result<RegistrationEvent>.Success(registrationEvent);
                    }
                    return Result<RegistrationEvent>.Failure($"No registration event found");

                }
                return Result<RegistrationEvent>.Failure($"This is an invalid email registration link");


            }
        }
    }
}
