using Application.Core;
using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RegistrationEvents
{
    public class Details
    {
        public class Query : IRequest<Result<RegistrationEvent>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<RegistrationEvent>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<RegistrationEvent>> Handle(Query request, CancellationToken cancellationToken)
            {
                var registrationEvent = await _context.RegistrationEvents.FindAsync(request.Id);
                return Result<RegistrationEvent>.Success(registrationEvent);
            }
        }
    }
}
