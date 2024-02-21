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

namespace Application.RegistrationEventWebsites
{
    public class Details
    {
        public class Query : IRequest<Result<RegistrationEventWebsite>>
        {
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<RegistrationEventWebsite>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<RegistrationEventWebsite>> Handle(Query request, CancellationToken cancellationToken)
            {
                var registrationEventWebsite = await _context.RegistrationEventsWebsites.FirstOrDefaultAsync(x => x.RegistrationEventId == request.RegistrationEventId);
                if (registrationEventWebsite == null) {
                    return Result<RegistrationEventWebsite>.Success(new RegistrationEventWebsite());
                }
                return Result<RegistrationEventWebsite>.Success(registrationEventWebsite);
            }
        }

    }
}
