using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace Persistence
{
    public class DataContext : IdentityDbContext
    {
        public DataContext(DbContextOptions options) : base(options) 
        {
        }

        public DbSet<Registration> Registrations { get; set; }
    }
}
