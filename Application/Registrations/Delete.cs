

using Application.Core;
using Domain;
using MediatR;
using Persistence;

namespace Application.Registrations
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
               var registration = await _context.Registrations.FindAsync(request.Id);

                if (registration == null) return null;
              
                _context.Remove(registration);

                var result = await _context.SaveChangesAsync() > 0;

                if (!result) return Result<Unit>.Failure("Failed to delete the registration");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
