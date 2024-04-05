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
    public class GetAnswerAttachments
    {
        public class Command : IRequest<Result<List<AnswerAttachment>>>
        {
            public ValidateDTO ValidateDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<List<AnswerAttachment>>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }
            public async Task<Result<List<AnswerAttachment>>> Handle(Command request, CancellationToken cancellationToken)
            {
                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();

                if (registrationLink != null)
                {
                    var registration = await _context.Registrations.Include(x => x.Answers)
                        .Where(x => x.Email == registrationLink.Email)
                        .Where(x => x.RegistrationEventId == registrationLink.RegistrationEventId)
                        .FirstOrDefaultAsync();

                    if (registration != null) {
                        var answerAttachments = await _context.AnswerAttachments.Where(x => x.RegistrationLookup == registration.Id).ToListAsync();
                        if (answerAttachments.Any())
                        {
                            return Result<List<AnswerAttachment>>.Success(answerAttachments);
                        }
                        else
                        {
                            return Result<List<AnswerAttachment>>.Success(new List<AnswerAttachment>());
                        }
                    }
                    else
                    {
                        return Result<List<AnswerAttachment>>.Success(new List<AnswerAttachment>());
                    }
                }
                else
                {
                    return Result<List<AnswerAttachment>>.Success(new List<AnswerAttachment>());
                }
            }

        }
    }
}
