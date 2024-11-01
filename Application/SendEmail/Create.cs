using Application.Core;
using Application.EmailLink;
using Domain;
using MediatR;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.SendEmail
{
    public class Create
    {
        public class Command : IRequest<Result<Unit>>
        {
            public EmailRequestDTO EmailRequestDTO { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IConfiguration _config;

            public Handler(IConfiguration config) {
                _config = config;   
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                Settings s = new Settings();
                var settings = s.LoadSettings(_config);
                GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));
                try
                {
                    await GraphHelper.SendEmail(
                        request.EmailRequestDTO.Recipients,request.EmailRequestDTO.Subject, request.EmailRequestDTO.Body);

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"An error occurred when trying to send email: {ex.Message}");
                }
            }
        }
    }
}
