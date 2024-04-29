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

namespace Application.RegistrationEventDocumentLibraries
{
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public RegistrationEventDocumentLibrary RegistrationEventDocumentLibrary { get; set; }
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
                RegistrationEventDocumentLibrary existingRegistrationEventDocumentLibrary = await _context.RegistrationEventDocumentLibraries.FirstOrDefaultAsync(
                    x => x.RegistrationEventId == request.RegistrationEventDocumentLibrary.RegistrationEventId);

                if (existingRegistrationEventDocumentLibrary != null)
                {
                    existingRegistrationEventDocumentLibrary.TreeData = request.RegistrationEventDocumentLibrary.TreeData;
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to update the registration event document library: {ex.Message}");
                    }
                   

                    return Result<Unit>.Success(Unit.Value);
                }
                else
                {
                    RegistrationEventDocumentLibrary newRegistrationEventDocumentLibrary = new RegistrationEventDocumentLibrary
                    {
                        RegistrationEventId = request.RegistrationEventDocumentLibrary.RegistrationEventId,
                        TreeData = request.RegistrationEventDocumentLibrary.TreeData
                    };
                    await _context.RegistrationEventDocumentLibraries.AddAsync(newRegistrationEventDocumentLibrary);
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to insert the registration event document library: {ex.Message}");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
            }
        }
    }
}
