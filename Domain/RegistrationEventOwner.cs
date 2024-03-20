using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RegistrationEventOwner
    {
        public Guid Id { get; set; }
        public Guid RegistrationEventId { get; set; }

        public RegistrationEvent RegistrationEvent { get; set; }
        public string Email { get; set; }   

    }
}
