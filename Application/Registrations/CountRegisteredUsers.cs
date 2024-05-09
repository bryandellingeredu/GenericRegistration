using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class CountRegisteredUsers
    {
        public class Query : IRequest<Result<int>>
        {
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<int>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<int>> Handle(Query request, CancellationToken cancellationToken)
            {
                int result = await _context.Registrations.CountAsync(x => x.RegistrationEventId == request.RegistrationEventId && x.Registered);
                return Result<int>.Success(result);
            }
        }
    }
}
