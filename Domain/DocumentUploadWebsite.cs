using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class DocumentUploadWebsite
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public Guid RegistrationEventId { get; set; }
        public RegistrationEvent RegistrationEvent { get; set; }
    }
}
