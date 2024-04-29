using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RegistrationEventDocumentLibrary
    {
        public Guid Id { get; set; }
        public Guid RegistrationEventId { get; set; }
        public string TreeData { get; set; }
    }
}
