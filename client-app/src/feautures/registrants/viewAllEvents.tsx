import { observer } from 'mobx-react-lite';
import RegistrantNavbar from '../../app/layout/RegistrantNavbar';
import { CardGroup, Container, Header, Icon } from 'semantic-ui-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationEvent } from '../../app/models/registrationEvent';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';

import LoadingComponent from '../../app/layout/LoadingComponent';
import RegistrantEventCard from './registrantEventCard';
import { useStore } from '../../app/stores/store';

export default observer(function ViewAllEvents() {
  const { responsiveStore } = useStore();
  const { isMobile } = responsiveStore;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<
    RegistrationEvent[]
  >([]);
  useEffect(() => {
    getRegistrationEvents();
  }, []);

  const getRegistrationEvents = async () => {
    setLoading(true);
    try {
      const data: RegistrationEvent[] = await agent.Registrants.list();
      setRegistrationEvents(data);
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('An error occured loading data');
      }
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <LoadingComponent content="Loading events..." />;

  return (
    <>
      <RegistrantNavbar />
      <Container fluid style={{ color: '#333', paddingTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ textAlign: 'center', width: '100%' }}>
            <Header
              as="h1"
              icon
              style={{
                display: 'inline-block',
                margin: '0 auto',
                color: '#0d47a1',
              }}
            >
              {' '}
              {/* Dark blue text */}
              <Icon name="ticket" color="teal" />{' '}
              {/* Icon color changed to red */}
              Register for Events
              <Header.Subheader style={{ color: '#666' }}>
                {' '}
                {/* Lighter text for the subheader */}
                <h3>Click an Event to go to the Event's Registration Page</h3>
              </Header.Subheader>
            </Header>
          </div>
        </div>
        <CardGroup
          itemsPerRow={isMobile ? '1' : '3'}
          style={{ padding: '40px' }}
        >
          {registrationEvents.map((event) => (
            <RegistrantEventCard key={event.id} event={event} />
          ))}
        </CardGroup>
      </Container>
    </>
  );
});
