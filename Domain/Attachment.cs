using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class Attachment
    {
           public Guid Id { get; set; }
           public byte[] BinaryData {get; set;}
    }
}