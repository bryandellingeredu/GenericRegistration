using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class QuestionOption
    {
        public Guid Id { get; set; }
        public string OptionText { get; set; }
        public string OptionQuota { get; set; } 
        public int Index { get; set; }
        public Guid CustomQuestionId { get; set; }
        public CustomQuestion CustomQuestion { get; set; }


    }
}
