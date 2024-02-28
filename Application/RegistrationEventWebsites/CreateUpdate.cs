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
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to update the registration website: {ex.Message}");
                    }
                   

                    return Result<Unit>.Success(Unit.Value);
                }
                else
                {
                    RegistrationEventWebsite newRegistrationEventWebsite = new RegistrationEventWebsite();
                    newRegistrationEventWebsite.RegistrationEventId = request.RegistrationEventWebsite.RegistrationEventId;
                    newRegistrationEventWebsite.Content = request.RegistrationEventWebsite.Content;
                    await _context.RegistrationEventsWebsites.AddAsync(newRegistrationEventWebsite);
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to insert the registration website: {ex.Message}");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
            }
        }
    }
}
