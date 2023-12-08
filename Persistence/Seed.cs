using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData (DataContext context)
        {
            if (context.Registrations.Any()) return;

            var registrations = new List <Registration>{
                new Registration
                {
                  FirstName = "Bryan",
                  LastName = "Dellinger",
                  Phone = "(717) 713 - 4498",
                  Email = "bryan.dellinger.civ@armywarcollege.edu",
                  RegistrationDate = DateTime.Now
                }
            };
            await context.Registrations.AddRangeAsync(registrations);
            await context.SaveChangesAsync();
        }
    }
}