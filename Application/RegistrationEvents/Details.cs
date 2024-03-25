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
                    .Include(x => x.Registrations).ThenInclude(x => x.Answers)
                    .Include(x => x.CustomQuestions)
                    .Where(x => x.Id == request.Id)   
                    .AsNoTracking()
                    .FirstAsync();
                foreach (var registration in registrationEvent.Registrations)
                {
                    registration.RegistrationEvent = null;
                }
                foreach (var question in registrationEvent.CustomQuestions)
                {
                    question.Options = null;
                    question.RegistrationEvent = null;
                }

                return Result<RegistrationEvent>.Success(registrationEvent);
            }
        }
    }
}
