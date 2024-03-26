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

namespace Application.RegistrationEvents
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var registrationEvent = await _context.RegistrationEvents.FindAsync(request.Id, cancellationToken);

                if (registrationEvent == null) return null;

                var registrationLinks = await _context.RegistrationLinks
                 .Where(x => x.RegistrationEventId == request.Id)
                 .ToListAsync();

                if (registrationLinks.Any())
                {
                    _context.RemoveRange(registrationLinks);
                    await _context.SaveChangesAsync();
                }
                _context.Remove(registrationEvent);
                var result = await _context.SaveChangesAsync() > 0;

                if (!result) return Result<Unit>.Failure("Failed to delete the registration");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
