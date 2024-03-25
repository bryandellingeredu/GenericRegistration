using Application.Core;
using MediatR;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class ChangeRegistered
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegisteredDTO RegisteredDTO { get; set; }
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
               var registration = await _context.Registrations.FindAsync(request.Id, cancellationToken);
               registration.Registered = request.RegisteredDTO.Registered;
                try
                {
                    await _context.SaveChangesAsync();
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"An error occurred when trying to update the registration: {ex.Message}");
                }

            }
        }
    }
}
