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

namespace Application.Registrations
{
    public class List
    {
        public class Query : IRequest<Result<List<Registration>>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<Registration>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<Registration>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var registrations = await _context.Registrations.Where(x => x.RegistrationEventId == request.Id).ToListAsync();
                if (registrations.Any()) {
                    return Result<List<Registration>>.Success(registrations);
                }
                else
                {
                    return Result<List<Registration>>.Success(new List<Registration>());
                }
              
            }
        }
    }
}
