using Application.Core;
using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.AnswerAttachments
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

           
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                AnswerAttachment answerAttachment = await _context.AnswerAttachments.FindAsync(request.Id);
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
        }

    }
}
