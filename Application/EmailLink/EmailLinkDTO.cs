﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class EmailLinkDTO
    {
        public Guid RegistrationEventId { get; set; }
        public string Email {  get; set; }  
    }
}
