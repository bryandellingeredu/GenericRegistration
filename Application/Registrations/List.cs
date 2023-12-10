using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Core;


namespace Application.Registrations
{
    public class List
    {
        public class Query : IRequest<Result<List<Registration>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Registration>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Registration>>> Handle(Query request, CancellationToken cancellationToken)
            {
                return Result<List<Registration>>.Success(await _context.Registrations.ToListAsync(cancellationToken));
            }
        }
    }
}
