using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Answer
    {
        public Guid Id { get; set; }
        public string AnswerText { get; set; } 
        
        public Guid RegistrationId { get; set; }

        public Guid CustomQuestionId { get; set; }  
    }
}
