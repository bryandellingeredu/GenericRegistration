using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;


namespace Application.AnswerAttachments
{
    public class List
    {
        public class Query : IRequest<Result<List<AnswerAttachment>>>
        {
            public Guid RegistrationId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<AnswerAttachment>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<AnswerAttachment>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var answerAttachments = await _context.AnswerAttachments.Where(x => x.RegistrationLookup == request.RegistrationId).ToListAsync();
                if (answerAttachments.Any())
                {
                    return Result<List<AnswerAttachment>>.Success(answerAttachments);
                }
                else
                {
                    return Result<List<AnswerAttachment>>.Success(new List<AnswerAttachment>());
                }
            }
        }
    }
}
