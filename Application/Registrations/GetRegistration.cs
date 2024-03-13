using Application.Core;
using Application.EmailLink;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Migrations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class GetRegistration
    {
        public class Command : IRequest<Result<Registration>>
        {
            public GetRegistrationDTO GetRegistrationDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Registration>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Registration>> Handle(Command request, CancellationToken cancellationToken)
            {
                var registration = await _context.Registrations.Include(x => x.Answers)
                .Where(x => x.Email == request.GetRegistrationDTO.Email)
                       .Where(x => x.RegistrationEventId == request.GetRegistrationDTO.RegistrationEventId)
                       .FirstOrDefaultAsync();
                if (registration != null)
                {
                    return Result<Registration>.Success(registration);
                }
                else
                {
                    Guid registrationId = Guid.NewGuid();

                    List<Answer> answers = new List<Answer>();
                    List<CustomQuestion> customQuestions = await _context.CustomQuestions
                        .Where(x => x.RegistrationEventId == request.GetRegistrationDTO.RegistrationEventId)
                        .ToListAsync();

                    foreach (var question in customQuestions)
                    {
                        Answer answer = new Answer();
                        answer.Id = Guid.NewGuid();
                        answer.CustomQuestionId = question.Id;
                        answer.RegistrationId = registrationId;
                        answer.AnswerText = string.Empty;
                        answers.Add(answer);
                    }
                    Registration newRegistration = new Registration();
                    newRegistration.Id = registrationId;
                    newRegistration.RegistrationEventId = request.GetRegistrationDTO.RegistrationEventId;
                    newRegistration.Email = request.GetRegistrationDTO.Email;
                    newRegistration.Answers = answers;
                    return Result<Registration>.Success(newRegistration);
                }
            }
        }
    }
}
