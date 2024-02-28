using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RegistrationEvents
{
    public class CreateUpdate
    {

        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationEvent RegistrationEvent { get; set; }
            public string Email { get; set; }
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
                RegistrationEvent existingRegistrationEvent = await _context.RegistrationEvents.FirstOrDefaultAsync(x => x.Id == request.RegistrationEvent.Id);
                if (existingRegistrationEvent != null) {
                    existingRegistrationEvent.Title = request.RegistrationEvent.Title;
                    existingRegistrationEvent.Overview = request.RegistrationEvent.Overview;
                    existingRegistrationEvent.Location = request.RegistrationEvent.Location;
                    existingRegistrationEvent.StartDate = request.RegistrationEvent.StartDate;
                    existingRegistrationEvent.EndDate = request.RegistrationEvent.EndDate;
                    existingRegistrationEvent.LastUpdatedBy = request.Email;
                    request.RegistrationEvent.LastUpdatedAt = DateTime.UtcNow;
                    try
                    {
                        await _context.SaveChangesAsync();
                        return Result<Unit>.Success(Unit.Value);
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to update the registration event: {ex.Message}");
                    }
                   
                }
                else
                {
                    request.RegistrationEvent.CreatedBy = request.Email;
                    request.RegistrationEvent.CreatedAt = DateTime.UtcNow;
                    _context.RegistrationEvents.Add(request.RegistrationEvent);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to create registration event");
                    return Result<Unit>.Success(Unit.Value);
                }
               
            }
        }
    }
}
