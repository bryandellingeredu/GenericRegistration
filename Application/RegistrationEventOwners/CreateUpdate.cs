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
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public List<RegistrationEventOwner> RegistrationEventOwners { get; set; }
            public Guid RegistrationEventId { get; set; }
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
                List<RegistrationEventOwner> existingRegistrationEventOwners = await _context.RegistrationEventOwners
                    .Where(x => x.RegistrationEventId == request.RegistrationEventId).ToListAsync();

                if (existingRegistrationEventOwners.Any())
                {
                    _context.RegistrationEventOwners.RemoveRange(existingRegistrationEventOwners);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                foreach (var owner in request.RegistrationEventOwners)
                {
                    _context.RegistrationEventOwners.Add(owner);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
