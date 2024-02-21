using Application.Registrant;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    public class RegistrantsController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult> GetEvents() => HandleResult(await Mediator.Send(new List.Query()));
    }
}
