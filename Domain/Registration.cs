

namespace Domain
{
    public class Registration
    {
        public Guid Id { get; set; }
        public string FirstName {get; set;}
        public string LastName {get; set;}
        public string Email {get; set;}
        public string UserEmail {get; set;}
        public string Phone {get; set;}
        public bool Registered {get; set;}
       
        public DateTime RegistrationDate {get; set;}

        public Guid RegistrationEventId { get; set;}

        public List<Answer> Answers { get; set;}

    }
}