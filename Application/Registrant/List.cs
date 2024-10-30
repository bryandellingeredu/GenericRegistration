using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Registrant
{
    public class List
    {
        public class Query : IRequest<Result<List<RegistrationEvent>>> { }

        public class Handler : IRequestHandler<Query, Result<List<RegistrationEvent>>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<RegistrationEvent>>> Handle(Query request, CancellationToken cancellationToken)
            {
                {
                    var registrationEvents =
                        await _context.RegistrationEvents.Include(x => x.Registrations)
                         .Where(x => x.EndDate >= DateTime.Today)
                         .Where(x => x.Published)
                         .Where(x => x.Public)
                         .OrderBy(x => x.Title)
                         .ToListAsync(cancellationToken);


                    for (int i = registrationEvents.Count - 1; i >= 0; i--)
                    {
                        var registrationEvent = registrationEvents[i];
                        if (registrationEvent.RegistrationOpenDate.HasValue
                            && DateTime.Today < registrationEvent.RegistrationOpenDate.Value.Date)
                        {
                            registrationEvents.RemoveAt(i);
                        }
                    }

                    for (int i = registrationEvents.Count - 1; i >= 0; i--)
                    {
                        var registrationEvent = registrationEvents[i];
                        if (registrationEvent.RegistrationClosedDate.HasValue
                            && DateTime.Today > registrationEvent.RegistrationClosedDate.Value.Date)
                        {
                            registrationEvents.RemoveAt(i);
                        }
                    }



                    List<RegistrationEvent> result = new List<RegistrationEvent>();
                    foreach ( var registrationEvent in registrationEvents ) {
                        bool derivedRegistrationIsOpen = registrationEvent.RegistrationIsOpen;

                        if(derivedRegistrationIsOpen &&
                           registrationEvent.MaxRegistrantInd &&
                           !string.IsNullOrEmpty(registrationEvent.MaxRegistrantNumber)
                           && registrationEvent.Registrations != null
                           && registrationEvent.Registrations.Where(x => x.Registered).Any()
                           ){
                            var registeredCount = registrationEvent.Registrations.Count(x => x.Registered);
                            if (registeredCount >=  int.Parse(registrationEvent.MaxRegistrantNumber)) {
                                derivedRegistrationIsOpen = false;
                            }
                        }

                        result.Add(new RegistrationEvent   
                        { Id = registrationEvent.Id,
                          Title = registrationEvent.Title,
                          Location = registrationEvent.Location,
                          Overview = registrationEvent.Overview,
                          StartDate = registrationEvent.StartDate,
                          EndDate = registrationEvent.EndDate,
                          RegistrationOpenDate = registrationEvent.RegistrationOpenDate,
                          RegistrationClosedDate = registrationEvent.RegistrationClosedDate,
                          Published = registrationEvent.Published,
                          Certified = registrationEvent.Certified,
                          Public = registrationEvent.Public,
                          AutoApprove = registrationEvent.AutoApprove,
                          AutoEmail = registrationEvent.AutoEmail,
                          DocumentLibrary = registrationEvent.DocumentLibrary,
                          RegistrationIsOpen = derivedRegistrationIsOpen,
                          MaxRegistrantInd = registrationEvent.MaxRegistrantInd,
                          MaxRegistrantNumber = registrationEvent.MaxRegistrantNumber,
                          CreatedAt = registrationEvent.CreatedAt,
                          CreatedBy = registrationEvent.CreatedBy,
                          LastUpdatedAt = registrationEvent.LastUpdatedAt,
                          LastUpdatedBy = registrationEvent.LastUpdatedBy,  
                         });

                       }

                    return Result<List<RegistrationEvent>>.Success(result);
                }
            }

        }
    }
}
