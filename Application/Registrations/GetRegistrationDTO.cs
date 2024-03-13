using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Registrations
{
    public class GetRegistrationDTO
    {
        public string Email { get; set; }  
        public Guid RegistrationEventId { get; set; }    
    }
}
