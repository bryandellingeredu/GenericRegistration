using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.DocumentUploadWebsites
{
    public class Details
    {
        public class Query : IRequest<Result<DocumentUploadWebsite>>
        {
            public Guid RegistrationEventId { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<DocumentUploadWebsite>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<DocumentUploadWebsite>> Handle(Query request, CancellationToken cancellationToken)
            {
                var documentUploadWebsite = await _context.DocumentUploadWebsites.FirstOrDefaultAsync(x => x.RegistrationEventId == request.RegistrationEventId);
                if (documentUploadWebsite == null) {
                    return Result<DocumentUploadWebsite>.Success(new DocumentUploadWebsite());
                }
                return Result<DocumentUploadWebsite>.Success(documentUploadWebsite);
            }
        }

    }
}
