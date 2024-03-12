using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RegistrationLink
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public Guid RegistrationEventId { get; set; }
        public string RandomKey { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
