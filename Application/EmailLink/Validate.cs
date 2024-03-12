using Application.Core;
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
    public class Validate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public ValidateDTO ValidateDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler( DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLinks = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync(); 
                if (registrationLinks != null) {
                    return Result<Unit>.Success(Unit.Value);
                }
                return Result<Unit>.Failure($"This is an invalid email registration link");


            }
        }
    }
}
