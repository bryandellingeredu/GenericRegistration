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

namespace Application.RegistrationEventOwners
{
    public class List
    {
        public class Query : IRequest<Result<List<RegistrationEventOwner>>>
        {
            public Guid RegistrationEventId { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<List<RegistrationEventOwner>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<RegistrationEventOwner>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var registrationEventOwners = await _context.RegistrationEventOwners.Where(x => x.RegistrationEventId == request.RegistrationEventId).ToListAsync(cancellationToken);
                if (registrationEventOwners == null)
                {
                    return Result<List<RegistrationEventOwner>>.Success(new List<RegistrationEventOwner>());
                }
                foreach (var owner in registrationEventOwners)
                {
                    owner.RegistrationEvent = null;
                }
                return Result<List<RegistrationEventOwner>>.Success(registrationEventOwners);
            }
        }

    }
}
