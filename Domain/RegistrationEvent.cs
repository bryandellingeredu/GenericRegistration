﻿using System;
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

        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string LastUpdatedBy { get; set; }

        public List<CustomQuestion> CustomQuestions { get; set; }

        public RegistrationEventWebsite RegistrationEventWebsite { get; set; }

    }
}
