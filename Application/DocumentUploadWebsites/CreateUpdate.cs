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

namespace Application.DocumentUploadWebsites
{
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>
        {
            public DocumentUploadWebsite DocumentUploadWebsite { get; set; }
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
                DocumentUploadWebsite existingDocumentUploadWebsite = await _context.DocumentUploadWebsites.FirstOrDefaultAsync(
                    x => x.RegistrationEventId == request.DocumentUploadWebsite.RegistrationEventId);

                if (existingDocumentUploadWebsite != null)
                {
                    existingDocumentUploadWebsite.Content = request.DocumentUploadWebsite.Content;
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to update the Document Upload website: {ex.Message}");
                    }
                   

                    return Result<Unit>.Success(Unit.Value);
                }
                else
                {
                    DocumentUploadWebsite newDocumentUploadWebsite = new DocumentUploadWebsite();
                    newDocumentUploadWebsite.RegistrationEventId = request.DocumentUploadWebsite.RegistrationEventId;
                    newDocumentUploadWebsite.Content = request.DocumentUploadWebsite.Content;
                    await _context.DocumentUploadWebsites.AddAsync(newDocumentUploadWebsite);
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {

                        return Result<Unit>.Failure($"An error occurred when trying to insert the document upload website: {ex.Message}");
                    }
                    return Result<Unit>.Success(Unit.Value);
                }
            }
        }
    }
}
