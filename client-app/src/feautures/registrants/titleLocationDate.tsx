import { Header, Icon } from "semantic-ui-react";
import { RegistrationEvent } from "../../app/models/registrationEvent";

interface Props{
    registrationEvent : RegistrationEvent
}

export default function TitleLocationDate({registrationEvent} : Props){

    function formatDate(date : Date) {
        return new Date(date).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
      }

    function displayDateRange(startDate : Date, endDate : Date) {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
      
        // Check if start and end dates are the same
        if (formattedStartDate === formattedEndDate) {
          return formattedStartDate;
        } else {
          return `${formattedStartDate} - ${formattedEndDate}`;
        }
      }
  
    return(
        
        <>
        <Header as='h3'>
        <Icon name='pencil' />
         <Header.Content>
         {registrationEvent.title}
         </Header.Content>
        </Header> 
        <Header as='h3'>
        <Icon name='map marker alternate' />
         <Header.Content>
         {registrationEvent.location}
         </Header.Content>
        </Header> 
        <Header as='h3'>
        <Icon name='calendar' />
         <Header.Content>
         {displayDateRange(registrationEvent.startDate, registrationEvent.endDate)}
         </Header.Content>
        </Header> 
        </>
    )
}