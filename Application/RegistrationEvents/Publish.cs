using Application.Core;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RegistrationEvents
{
    public class Publish
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

                registrationEvent.Published = true;

                try
                {
                    await _context.SaveChangesAsync();
                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"An error occurred when trying to update the registration website: {ex.Message}");
                }

              
            }
        }

    }
}
