using Application.Core;
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

namespace Application.EmailLink
{
    public class GetRegistration
    {
        public class Command : IRequest<Result<Registration>>
        {
            public ValidateDTO ValidateDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Registration>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<Registration>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.ValidateDTO.EncryptedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
                if (registrationLink != null)
                {
                    var registration = await _context.Registrations.Include(x => x.Answers)
                        .Where(x => x.Email == registrationLink.Email)
                        .Where(x => x.RegistrationEventId == registrationLink.RegistrationEventId)
                        .FirstOrDefaultAsync();
                    if (registration != null)
                    {
                        return Result<Registration>.Success(registration);
                    }
                    else
                    {
                        Guid registrationId = Guid.NewGuid();

                        List<Answer> answers = new List<Answer>();
                        List<CustomQuestion> customQuestions = await _context.CustomQuestions.Where(x => x.RegistrationEventId == registrationLink.RegistrationEventId).ToListAsync();
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
                        newRegistration.RegistrationEventId = registrationLink.RegistrationEventId;
                        newRegistration.Email = registrationLink.Email;
                        newRegistration.Answers = answers;
                        return Result<Registration>.Success(newRegistration);
                    }


                }
                return Result<Registration>.Failure($"This is an invalid email registration link");


            }
        }
    }
}
