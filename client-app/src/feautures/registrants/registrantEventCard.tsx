import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Header, HeaderContent, Icon } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
interface Props {
    event: RegistrationEvent
  }

export default observer (function RegistrantEventCard({event} : Props) {
  const navigate = useNavigate();

    return(
        <Card color='teal'>
        <CardContent>
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
            onClick={() => navigate(`/registrationpagenoform/${event.id}`)}>
                  <Icon name='world' size="big" />
              Go To Registration Page
            </Button>
        </CardContent>
      </Card>
    )
});