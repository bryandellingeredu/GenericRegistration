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
    public class GetAnswerAttachment
    {
        public class Command : IRequest<Result<AnswerAttachment>>
        {
            public ValidateDTO ValidateDTO { get; set; }
            public Guid AnswerAttachmentId { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<AnswerAttachment>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<AnswerAttachment>> Handle(Command request, CancellationToken cancellationToken)
            {
                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();

                if (registrationLink != null)
                {
                    AnswerAttachment answerAttachment = await _context.AnswerAttachments.FindAsync(request.AnswerAttachmentId, cancellationToken);
                   return Result<AnswerAttachment>.Success(answerAttachment);

                }

                return Result<AnswerAttachment>.Failure($"This is an invalid document library link");
            }
        }
    }
}
