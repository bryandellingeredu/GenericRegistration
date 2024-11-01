﻿using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            private readonly IConfiguration _config;
            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var registration = await _context.Registrations.FindAsync(request.Id, cancellationToken);
              
                if (registration == null) return null;

                var registrationEvent = await _context.RegistrationEvents.AsNoTracking().FirstAsync(x => x.Id == registration.RegistrationEventId, cancellationToken);

                List<string> emails = new List<string>();
                emails.Add(registrationEvent.CreatedBy);
                List<RegistrationEventOwner> registrationEventOwners = await _context.RegistrationEventOwners
                .AsNoTracking()
                .Where(x => x.RegistrationEventId == registration.RegistrationEventId).ToListAsync();
                foreach (RegistrationEventOwner owner in registrationEventOwners)
                {
                    emails.Add(owner.Email);
                }

                string title = $"{registration.FirstName} {registration.LastName} has cancelled registration for {registrationEvent.Title}";
                string body = $"{registration.FirstName} {registration.LastName} has cancelled registration for {registrationEvent.Title}";
                body = body + $"<p><strong>First Name: </strong> {registration.FirstName}</p>";
                body = body + $"<p><strong>Last Name: </strong> {registration.LastName}</p>";
                body += $"<p><strong>Email: </strong> <a href='mailto:{registration.Email}'>{registration.Email}</a></p>";

                _context.Remove(registration);
                var result = await _context.SaveChangesAsync() > 0;

                if (!result) return Result<Unit>.Failure("Failed to delete the registration");

                await SendEmailToEventOwner(title, body,  emails);

                return Result<Unit>.Success(Unit.Value);
            }

            private async Task SendEmailToEventOwner(string title, string body,  List<string> emails)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                await GraphHelper.SendEmail(emails.ToArray(), title, body);
            }
        }
    }
}
