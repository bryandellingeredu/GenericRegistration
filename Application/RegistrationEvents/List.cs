using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph.Models;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
            private readonly UserManager<IdentityUser> _userManager;
            public Handler(DataContext context, UserManager<IdentityUser> userManager)
            {
                _context = context;
                _userManager = userManager;
            }
            public async Task<Result<List<RegistrationEvent>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    return Result<List<RegistrationEvent>>.Failure("User not found.");
                }

                var roles = await _userManager.GetRolesAsync(user);
                var isAdmin = roles.Contains("Administrators");

                var result = await _context.RegistrationEvents
                    .Where(x => x.CreatedBy == request.Email ||
                                x.RegistrationEventOwners.Any(o => o.Email == request.Email) ||
                                isAdmin)
                    .OrderBy(x => x.StartDate)
                    .ThenBy(x => x.Title)
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
                        RegistrationIsOpen = x.RegistrationIsOpen,
                        RegistrationOpenDate = x.RegistrationOpenDate,
                        RegistrationClosedDate = x.RegistrationClosedDate,
                        MaxRegistrantInd = x.MaxRegistrantInd,
                        MaxRegistrantNumber = x.MaxRegistrantNumber
                    })
                   .ToListAsync();

                return Result<List<RegistrationEvent>>.Success(result);
            }
        }
    }
}
