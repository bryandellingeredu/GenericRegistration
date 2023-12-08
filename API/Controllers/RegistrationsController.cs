

using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class RegistrationsController : BaseApiController
    {
        private readonly DataContext _context;
        public RegistrationsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Registration>>> GetRegistrations(){
            return await _context.Registrations.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Registration>> GetRegistration(Guid id){
            return await _context.Registrations.FindAsync(id);
        }
    }
}