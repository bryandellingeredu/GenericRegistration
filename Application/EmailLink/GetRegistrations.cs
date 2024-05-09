using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class GetRegistrations
    {
        public class Command : IRequest<Result<List<Registration>>>
        {
            public ValidateDTO ValidateDTO { get; set; }
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<List<Registration>>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }
            public async Task<Result<List<Registration>>> Handle(Command request, CancellationToken cancellationToken)
            {
                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();

                if (registrationLink != null)
                {
                    List<Registration> registrationList = await _context.Registrations.Where(x => x.RegistrationEventId == request.RegistrationEventId).ToListAsync();
                    if (registrationList.Any())
                    {
                        return Result<List<Registration>>.Success(registrationList);
                    }
                    else
                    {
                        return Result<List<Registration>>.Success(new List<Registration>());
                    }
                }
                else{
                    return Result<List<Registration>>.Failure($"This is an invalid email registration link");
                }
            }
        }
    }
}
