﻿using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailLink
{
    public class RegistrationDTO : Registration
    {
        public string DecodedKey {  get; set; }
        public string Hcontent { get; set; }    
    }
}
