using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RegistrationEvent
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string Location { get; set; }

        public string Overview { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime? RegistrationOpenDate {get; set;}

        public DateTime? RegistrationClosedDate {get; set;}

        public bool Published {get; set;}
        public bool Certified {get; set;}

        public bool Public { get; set; }
        public bool AutoApprove { get; set;}   
        public bool AutoEmail { get; set;}   

        public bool DocumentLibrary {get; set;}

        public bool RegistrationIsOpen {get; set;} 
        public bool  MaxRegistrantInd {get; set;}
        public string MaxRegistrantNumber {get; set;}

        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string LastUpdatedBy { get; set; }

        public List<CustomQuestion> CustomQuestions { get; set; }

        public List<Registration> Registrations { get; set; }

        public List<RegistrationEventOwner> RegistrationEventOwners { get; set; }

        public RegistrationEventWebsite RegistrationEventWebsite { get; set; }

    }
}
