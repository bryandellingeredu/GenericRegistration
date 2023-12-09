using MediatR;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;


namespace Application.Registrations
{
    public class List
    {
        public class Query : IRequest<List<Registration>> { }

        public class Handler : IRequestHandler<Query, List<Registration>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<List<Registration>> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Registrations.ToListAsync();
            }
        }
    }
}
