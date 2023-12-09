using AutoMapper;
using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class Edit
    {
        public class Command : IRequest
        {
            public Registration Registration { get; set;}
        }

        public class Handler : IRequestHandler<Command> {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var registration = await _context.Registrations.FindAsync(request.Registration.Id);
                _mapper.Map(request.Registration, registration);    
                await _context.SaveChangesAsync();
            }
        }
    }
}
