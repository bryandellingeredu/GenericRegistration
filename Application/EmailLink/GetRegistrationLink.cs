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
    public class GetRegistrationLink
    {
        public class Command : IRequest<Result<RegistrationLink>>
        {
            public ValidateDTO ValidateDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<RegistrationLink>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<RegistrationLink>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
                if (registrationLink != null)
                {
                    return Result<RegistrationLink>.Success(registrationLink);

                }
                return Result<RegistrationLink>.Failure($"could not find registration link");


            }
        }
    }
}
