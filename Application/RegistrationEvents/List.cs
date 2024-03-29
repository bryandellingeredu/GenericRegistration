﻿using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.RegistrationEvents
{
    public class List
    {
        public class Query : IRequest<Result<List<RegistrationEvent>>> {
            public string Email { get; set; }

            public Query(string email)
            {
                Email = email;
            }
        }

        public class Handler : IRequestHandler<Query, Result<List<RegistrationEvent>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<RegistrationEvent>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var result = await _context.RegistrationEvents
                .Where(x => x.CreatedBy == request.Email || x.RegistrationEventOwners.Any(o => o.Email == request.Email))
                .Select(x => new RegistrationEvent
                {
                    Id = x.Id,
                    Title = x.Title,
                    Location = x.Location,
                    Overview = x.Overview,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    Published = x.Published,
                    Registrations = x.Registrations,    
                })
               .ToListAsync();

                return Result<List<RegistrationEvent>>.Success(result);
            }
        }
    }
}
