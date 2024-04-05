using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Migrations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.AnswerAttachments
{
    public class ListByRegistrationEvent
    {
        public class Query : IRequest<Result<List<AnswerAttachment>>>
        {
            public Guid RegistrationEventId { get; set; }
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
                var answerAttachments = await _context.AnswerAttachments
                    .Where(aa => _context.Registrations
                            .Where(r => r.RegistrationEventId == request.RegistrationEventId)
                            .Select(r => r.Id)
                    .Contains(aa.RegistrationLookup))
                    .ToListAsync();

                if (answerAttachments != null && answerAttachments.Any()) return Result<List<AnswerAttachment>>.Success(answerAttachments);

                return Result<List<AnswerAttachment>>.Success(new List<AnswerAttachment>());

          
            }
        }
    }
}
