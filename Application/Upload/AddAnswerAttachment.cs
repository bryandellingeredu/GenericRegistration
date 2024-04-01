using Application.Core;
using Application.EmailLink;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Upload
{
    public class AddAnswerAttachment
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid AnswerAttachmentId { get; set; }
            public Guid CustomQuestionId { get; set; }
            public Guid RegistrationId { get; set; }
            public IFormFile File { get; set; }
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
                try
                {
                    using (var stream = request.File.OpenReadStream())
                    using (var ms = new MemoryStream()) {
                        stream.CopyTo(ms);
                        var attachment = new Domain.Attachment { BinaryData = ms.ToArray() };
                        await _context.Attachments.AddAsync(attachment);
                        await _context.SaveChangesAsync();
                        var existingAnswerAttachment = await _context.AnswerAttachments.FirstOrDefaultAsync(x => x.Id == request.AnswerAttachmentId);
                        if (existingAnswerAttachment != null)
                        {
                            existingAnswerAttachment.AttachmentId = attachment.Id;
                            existingAnswerAttachment.FileName = request.File.FileName;
                            existingAnswerAttachment.FileType = request.File.ContentType;
                            await _context.SaveChangesAsync();
                            return Result<Unit>.Success(Unit.Value);
                        }
                        else
                        {
                            AnswerAttachment newAnswerAttachment = new AnswerAttachment
                            {
                                Id = request.AnswerAttachmentId,    
                                AttachmentId = attachment.Id,
                                RegistrationLookup = request.RegistrationId,
                                CustomQuestionLookup = request.CustomQuestionId,
                                FileName = request.File.FileName,
                                FileType = request.File.ContentType
                        };
                            _context.AnswerAttachments.Add(newAnswerAttachment);
                            await _context.SaveChangesAsync();
                            return Result<Unit>.Success(Unit.Value);

                        }

                    }

                }
                catch (Exception ex)
                {

                    Result<Unit>.Failure($"Failed to Create Answer Attachment{ex.Message}");

                }
                return Result<Unit>.Success(Unit.Value);

            }
        }
    }
}