using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class Details
    {
        public class Query : IRequest<Registration>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Registration>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Registration> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Registrations.FindAsync(request.Id);
            }
        }
    }
}
