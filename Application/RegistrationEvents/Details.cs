using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.IO.Pipes;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RegistrationEvents
{
    public class Details
    {
        public class Query : IRequest<Result<RegistrationEvent>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<RegistrationEvent>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<RegistrationEvent>> Handle(Query request, CancellationToken cancellationToken)
            {

                var registrationEvent = await _context.RegistrationEvents
                    .Where(x => x.Id == request.Id)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (registrationEvent == null)
                {
                    return Result<RegistrationEvent>.Failure("registration event not found");
                }

                var registrations = await _context.Registrations
                .Where(r => r.RegistrationEventId == registrationEvent.Id)
                .Include(r => r.Answers)
                .AsNoTracking()
                .ToListAsync();

                var customQuestions = await _context.CustomQuestions
                    .Where(c => c.RegistrationEventId == registrationEvent.Id)
                    .Include(c => c.Options)
                    .AsNoTracking()
                    .ToListAsync();

                registrationEvent.Registrations = registrations;
                registrationEvent.CustomQuestions = customQuestions;

                foreach (var registration in registrationEvent.Registrations)
                {
                    registration.RegistrationEvent = null;
                }
                foreach (var question in registrationEvent.CustomQuestions)
                {
                    question.RegistrationEvent = null;
                    foreach (var option in question.Options)
                    {
                        option.CustomQuestion = null;
                    }
                }

                return Result<RegistrationEvent>.Success(registrationEvent);
            }
        }
    }
}
