using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class CustomQuestion
    {
        public Guid Id { get; set; }
        public string QuestionText { get; set; }
        public QuestionType QuestionType { get; set; }
        public bool Required { get; set; }
        public int Index { get; set; }
        public Guid RegistrationEventId { get; set; }
        public RegistrationEvent RegistrationEvent { get; set; }

        public List<QuestionOption> Options { get; set; }

        public CustomQuestion()
        {
            Options = new List<QuestionOption>();
        }

    }
}
