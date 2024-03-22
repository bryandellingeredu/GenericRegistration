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

namespace Application.Registrant
{
    public class List
    {
        public class Query : IRequest<Result<List<RegistrationEvent>>> { }

        public class Handler : IRequestHandler<Query, Result<List<RegistrationEvent>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<RegistrationEvent>>> Handle(Query request, CancellationToken cancellationToken)
            {
                {
                    var result = Result<List<RegistrationEvent>>.Success(
                        await _context.RegistrationEvents
                         .Where(x => x.EndDate >= DateTime.Today)
                         .Where(x => x.Published)
                         .Where(x => x.Public)
                         .OrderBy(x => x.Title)
                         .ToListAsync(cancellationToken)
                   );
                    return result;
                }
            }

        }
    }
}
