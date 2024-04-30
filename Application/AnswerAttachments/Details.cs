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

namespace Application.AnswerAttachments
{
    public class Details
    {
        public class Query : IRequest<Result<AnswerAttachment>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<AnswerAttachment>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) => _context = context;

            public async Task<Result<AnswerAttachment>> Handle(Query request, CancellationToken cancellationToken) =>
               Result<AnswerAttachment>.Success(await _context.AnswerAttachments.FindAsync(request.Id, cancellationToken));
        }

    }
}
