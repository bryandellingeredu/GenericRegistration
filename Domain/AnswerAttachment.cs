using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class AnswerAttachment
    {
         public Guid Id { get; set; }
         public Guid AttachmentId {get; set;}
        public Guid RegistrationLookup { get; set; }
        public Guid CustomQuestionLookup { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }


    }
}