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

namespace Application.RegistrationEventDocumentLibraries
{
    public class Details
    {
        public class Query : IRequest<Result<RegistrationEventDocumentLibrary>>
        {
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<RegistrationEventDocumentLibrary>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<RegistrationEventDocumentLibrary>> Handle(Query request, CancellationToken cancellationToken)
            {
                var registrationEventDocumentLibrary = await _context.RegistrationEventDocumentLibraries.FirstOrDefaultAsync(x => x.RegistrationEventId == request.RegistrationEventId);
                if (registrationEventDocumentLibrary == null) {
                    return Result<RegistrationEventDocumentLibrary>.Success(new RegistrationEventDocumentLibrary());
                }
                return Result<RegistrationEventDocumentLibrary>.Success(registrationEventDocumentLibrary);
            }
        }

    }
}
