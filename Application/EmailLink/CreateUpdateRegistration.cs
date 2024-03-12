using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;


namespace Application.EmailLink
{
    public class CreateUpdateRegistration
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationDTO RegistrationDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly EncryptionHelper _encryptionHelper;
            public Handler(DataContext context, EncryptionHelper encryptionHelper)
            {
                _context = context;
                _encryptionHelper = encryptionHelper;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {

                var encryptedKeyBytes = Convert.FromBase64String(request.RegistrationDTO.DecodedKey);
                var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
                var registrationLink = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
                if (registrationLink != null)
                {
                    var existingRegistration =await _context.Registrations.Where(x => x.Id == request.RegistrationDTO.Id).FirstOrDefaultAsync();
                    if (existingRegistration != null) {
                        existingRegistration.FirstName = request.RegistrationDTO.FirstName; 
                        existingRegistration.LastName = request.RegistrationDTO.LastName;
                        existingRegistration.Phone = request.RegistrationDTO.Phone;
                        existingRegistration.Email = request.RegistrationDTO.Email;
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
                        newRegistration.Id = request.RegistrationDTO.Id;
                        newRegistration.RegistrationEventId = request.RegistrationDTO.RegistrationEventId;
                        newRegistration.FirstName = request.RegistrationDTO.FirstName;
                        newRegistration.LastName = request.RegistrationDTO.LastName;
                        newRegistration.Phone = request.RegistrationDTO.Phone;
                        newRegistration.Email = request.RegistrationDTO.Email;
                        newRegistration.RegistrationDate = DateTime.UtcNow;
                        newRegistration.Answers = request.RegistrationDTO.Answers;
                        _context.Registrations.Add(newRegistration);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create registration");
                        return Result<Unit>.Success(Unit.Value);
                    }

                }
                return Result<Unit>.Failure($"invalid registration link");


            }
        }
    }
}
