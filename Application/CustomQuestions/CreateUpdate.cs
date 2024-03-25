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

namespace Application.CustomQuestions
{
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public List<CustomQuestion> CustomQuestions { get; set; }
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
                List<Registration> registrations = await _context.Registrations
                    .Where(x => x.RegistrationEventId == request.RegistrationEventId)
                    .AsNoTracking()
                    .ToListAsync();

                if (registrations.Any())
                {
                    return Result<Unit>.Success(Unit.Value);
                }
                List<CustomQuestion> existingCustomQuestions = await _context.CustomQuestions
                    .Include(x => x.Options)
                    .Where(x => x.RegistrationEventId == request.RegistrationEventId)
                    .ToListAsync(cancellationToken);

                if (existingCustomQuestions.Any())
                {
                    _context.CustomQuestions.RemoveRange(existingCustomQuestions);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                foreach (var question in request.CustomQuestions)
                {
                    _context.CustomQuestions.Add(question);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return Result<Unit>.Success(Unit.Value); 
            }
        }
    }
}
