import { observer } from "mobx-react-lite";
import { Container, Header, Icon, Button, CardGroup } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import EventCard from "./eventCard";



export default observer (function MyRegistrations() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [registrationEvents, setRegistrationEvents] = useState<RegistrationEvent[]>([]);

    useEffect(() => {
        getRegistrationEvents();
      }, []);

    const handleRemoveRegistrationEvent = (id : string) => {
      setRegistrationEvents(registrationEvents.filter(event => event.id !== id));
    }

    const getRegistrationEvents = async () => {
        setLoading(true);
        try{
          const data : RegistrationEvent[] = await agent.RegistrationEvents.list();
          setRegistrationEvents(data);
        }catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("An error occured loading data");
        }
      }finally {
        setLoading(false);
      }
    }

    
    if (loading) return <LoadingComponent content="Loading events..."/>
    return (
        <>
            <ManageRegistrationNavbar />
            <Container fluid style={{ color: '#333', paddingTop: '20px' }}> {/* Light grey background, dark text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Wrapper div for the Header to center it horizontally */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <Header as='h1' icon style={{ display: 'inline-block', margin: '0 auto', color: '#0d47a1' }}> {/* Dark blue text */}
                            <Icon name='calendar check outline' color='teal' /> {/* Icon color changed to red */}
                            Manage Your Events
                            <Header.Subheader style={{ color: '#666' }}> {/* Lighter text for the subheader */}
                                <h3>Edit your events or create new ones. Organize your upcoming classes, symposiums, and registration-required activities.</h3>
                            </Header.Subheader>
                        </Header>
                    </div>
                    <Button color='green' size='large' style={{ position: 'absolute', right: '20px', top: '60px' }} onClick={() => {navigate('/newregistration')}}>
                        <Icon name='add' /> Create New Event
                    </Button>
                </div>
                <CardGroup itemsPerRow={3} style={{padding: '40px'}}>
                    {registrationEvents.map((event) => (
                        <EventCard key={event.id} event={event} removeEvent={handleRemoveRegistrationEvent}/>
                    ))}
                </CardGroup>
            </Container>
        </>
    );
});
