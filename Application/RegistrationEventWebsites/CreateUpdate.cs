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
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationEventWebsite RegistrationEventWebsite { get; set; }
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
                RegistrationEventWebsite existingRegistrationEventWebsite = await _context.RegistrationEventsWebsites.FirstOrDefaultAsync(
                    x => x.RegistrationEventId == request.RegistrationEventWebsite.RegistrationEventId);

                if (existingRegistrationEventWebsite != null)
                {
                    existingRegistrationEventWebsite.Content = request.RegistrationEventWebsite.Content;
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to update registration event website");
                    return Result<Unit>.Success(Unit.Value);
                }
                else
                {
                    RegistrationEventWebsite newRegistrationEventWebsite = new RegistrationEventWebsite();
                    newRegistrationEventWebsite.RegistrationEventId = request.RegistrationEventWebsite.RegistrationEventId;
                    newRegistrationEventWebsite.Content = request.RegistrationEventWebsite.Content;
                    await _context.RegistrationEventsWebsites.AddAsync(newRegistrationEventWebsite);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to create registration event website");
                    return Result<Unit>.Success(Unit.Value);
                }
            }
        }
    }
}
