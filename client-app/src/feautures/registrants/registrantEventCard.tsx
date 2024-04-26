import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Header, HeaderContent, Icon } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";
interface Props {
    event: RegistrationEvent
  }

export default observer (function RegistrantEventCard({event} : Props) {
  const navigate = useNavigate();
  const { responsiveStore } = useStore();
  const {isMobile} = responsiveStore
  const cardStyle = {
    opacity: event.registrationIsOpen ? 1 : 0.3, // Lower opacity for disabled effect
    pointerEvents: event.registrationIsOpen ? 'auto' : 'none' // Disables interaction if card is disabled
};
    return(
        <Card color='teal' style={cardStyle}>
        <CardContent>
          {!event.registrationIsOpen && 
          <CardHeader textAlign="center" style={{paddingBottom: '10px'}}><h2>Registration For This Event is Closed</h2></CardHeader>
          }
          <CardHeader textAlign="center" style={{paddingBottom: '10px'}}><h2>{event.title}</h2></CardHeader>
          <CardMeta style={{paddingBottom: '10px'}}>
          <Header as='h4' color='grey'>
             <Icon name='map marker' />
               <HeaderContent>{event.location}</HeaderContent>
            </Header>
          </CardMeta>
          <CardMeta>
          <Header as='h4' color='grey'>
             <Icon name='calendar' />
             <HeaderContent>
                {new Date(event.startDate).toLocaleDateString('en-US', {
                     month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                })} - {new Date(event.endDate).toLocaleDateString('en-US', {
                     month: '2-digit',
                     day: '2-digit',
                     year: 'numeric',
                })}
            </HeaderContent>

            </Header>
          </CardMeta>
          <CardDescription>
            {event.overview}
          </CardDescription>
        </CardContent>
        <CardContent extra>
 
            <Button  color='teal' fluid size='huge' icon labelPosition='left'
            disabled={!event.registrationIsOpen}
            onClick={() => navigate(`/registerforevent/${event.id}`)}>
              {!isMobile &&  <Icon name='world' size="big" /> }
              Go To Registration Page
          
            </Button>
        </CardContent>
      </Card>
    )
});