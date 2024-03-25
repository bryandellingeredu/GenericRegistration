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
        public DbSet<RegistrationEvent> RegistrationEvents { get; set; }
        public DbSet<CustomQuestion> CustomQuestions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<RegistrationEventWebsite> RegistrationEventsWebsites { get; set; } 
        public DbSet<RegistrationLink> RegistrationLinks { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<RegistrationEventOwner> RegistrationEventOwners { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Ensure Identity configurations are applied

            modelBuilder.Entity<RegistrationEvent>()
             .HasMany(e => e.RegistrationEventOwners)
             .WithOne(q => q.RegistrationEvent)
             .HasForeignKey(q => q.RegistrationEventId)
             .OnDelete(DeleteBehavior.Cascade);

             modelBuilder.Entity<RegistrationEvent>()
             .HasMany(e => e.Registrations)
             .WithOne(q => q.RegistrationEvent)
             .HasForeignKey(q => q.RegistrationEventId)
             .OnDelete(DeleteBehavior.Cascade);

            // Configuration for RegistrationEvent to CustomQuestions
            modelBuilder.Entity<RegistrationEvent>()
                .HasMany(e => e.CustomQuestions)
                .WithOne(q => q.RegistrationEvent)
                .HasForeignKey(q => q.RegistrationEventId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade deletes to CustomQuestions

            // Configuration for CustomQuestion to QuestionOptions, acknowledging the back reference
            modelBuilder.Entity<CustomQuestion>()
                .HasMany(q => q.Options)
                .WithOne(o => o.CustomQuestion)
                .HasForeignKey(o => o.CustomQuestionId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade deletes to Options

            // Add other configurations as needed
        }
    }
}
