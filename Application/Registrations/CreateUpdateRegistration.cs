using Application.Core;
using Application.EmailLink;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;


namespace Application.Registrations
{
    public class CreateUpdateRegistration
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Registration Registration { get; set; }
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
                var existingRegistration = await _context.Registrations
                    .Include(x => x.Answers)
                    .Where(x => x.Id == request.Registration.Id).FirstOrDefaultAsync();
                if (existingRegistration != null)
                {
                    existingRegistration.FirstName = request.Registration.FirstName;
                    existingRegistration.LastName = request.Registration.LastName;
                    existingRegistration.Phone = request.Registration.Phone;
                    existingRegistration.Email = request.Registration.Email;
                    if(existingRegistration.Answers.Any()) {
                        foreach(var answer in existingRegistration.Answers)
                        {
                            answer.AnswerText = request.Registration.Answers.FirstOrDefault(x => x.Id == answer.Id).AnswerText ?? string.Empty;
                        }
                    }
                    else
                    {
                        existingRegistration.Answers = request.Registration.Answers;
                    }
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
                else
                {
                    Registration newRegistration = new Registration();
                    newRegistration.Id = request.Registration.Id;
                    newRegistration.RegistrationEventId = request.Registration.RegistrationEventId;
                    newRegistration.FirstName = request.Registration.FirstName;
                    newRegistration.LastName = request.Registration.LastName;
                    newRegistration.Phone = request.Registration.Phone;
                    newRegistration.Email = request.Registration.Email;
                    newRegistration.RegistrationDate = DateTime.UtcNow;
                    newRegistration.Answers = request.Registration.Answers;
                    _context.Registrations.Add(newRegistration);
                    var result = await _context.SaveChangesAsync() > 0;
                    if (!result) return Result<Unit>.Failure("Failed to create registration");
                    return Result<Unit>.Success(Unit.Value);
                }
            }
        }
    }
}
