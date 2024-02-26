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

namespace Application.CustomQuestions
{
    public class Details
    {
        public class Query : IRequest<Result<List<CustomQuestion>>>
        {
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<CustomQuestion>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<CustomQuestion>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var customQuestions = await _context.CustomQuestions.Where(x => x.RegistrationEventId == request.RegistrationEventId).Include(x => x.Options).ToListAsync(cancellationToken);
                if (customQuestions == null)
                {
                    return Result<List<CustomQuestion>>.Success(new List<CustomQuestion>());
                }
                foreach (var question in customQuestions)
                {
                    foreach (var option in question.Options)
                    {
                        option.CustomQuestion = null; // Break the circular reference
                    }
                }
                return Result<List<CustomQuestion>>.Success(customQuestions);
            }
        }
    }
}
