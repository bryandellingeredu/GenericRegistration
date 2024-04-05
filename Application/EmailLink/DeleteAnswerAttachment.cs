using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class DeleteAnswerAttachment
    {
        public class Command : IRequest<Result<Unit>>
        {
            public ValidateDTO ValidateDTO { get; set; }
            public Guid AnswerAttachmentId { get; set; }
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
                if (registrationLink != null) {
                    AnswerAttachment answerAttachment = await _context.AnswerAttachments.FindAsync(request.AnswerAttachmentId);
                    Domain.Attachment attachment = await _context.Attachments.FindAsync(answerAttachment.AttachmentId);
                    _context.Remove(answerAttachment);
                    _context.Remove(attachment);
                    try
                    {
                        await _context.SaveChangesAsync();
                        return Result<Unit>.Success(Unit.Value);
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"Failed to delete the attachment: {ex.Message}");
                    }
                }
                else
                {
                    return Result<Unit>.Failure("unauthorized");
                }
            }
        }
    }
}
