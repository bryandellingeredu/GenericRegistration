import { observer } from "mobx-react-lite";
import { Container, Header, Icon, Button, CardGroup, FormGroup, FormField, Form, Radio, Search, SearchProps } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import EventCard from "./eventCard";
import { useStore } from "../../app/stores/store";



export default observer (function MyRegistrations() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showActive, setShowActive] = useState(true);
    const [registrationEvents, setRegistrationEvents] = useState<RegistrationEvent[]>([]);
    const [filteredResults, setFilteredResults] = useState<RegistrationEvent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { responsiveStore } = useStore();
    const {isMobile} = responsiveStore

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

    const handleSearchChange = (e: React.SyntheticEvent, { value }: SearchProps) => {
      setSearchQuery(value || '');
  
      const filtered = registrationEvents.filter(event =>
        event.title.toLowerCase().includes((value || '').toLowerCase())
      );
  
      setFilteredResults(filtered.map(event => ({
        id: event.id,
        title: event.title,
        location: event.location,
        overview: event.overview,
        startDate: event.startDate,
        endDate: event.endDate,
        published: event.published,
        public: event.public,
        autoApprove: event.autoApprove,
        autoEmail: event.autoEmail,
        documentLibrary: event.documentLibrary,
        certified: event.certified,
        registrationIsOpen: event.registrationIsOpen,
        maxRegistrantInd: event.maxRegistrantInd,
        maxRegistrantNumber: event.maxRegistrantNumber,
        registrations: event.registrations,
        customQuestions: event.customQuestions
      })));
    };

    const displayRegistrationEvents = () =>{
      if(filteredResults && filteredResults.length > 0) return filteredResults;
      return registrationEvents;
    }

    
    
    if (loading) return <LoadingComponent content="Loading events..."/>
    return (
        <>
            <ManageRegistrationNavbar />
            <Container fluid style={{ color: '#333', paddingTop: '20px' }}> {/* Light grey background, dark text */}
            <Form style={{ paddingLeft: '40px' }}>
              <Form.Group inline>
                <Form.Field>
                  <Search placeholder='Search...'
                        input={{ className: 'rounded-input' }} 
                        onSearchChange={handleSearchChange}
                        results={filteredResults}
                        />
                </Form.Field>
              <Form.Field>
                <Radio
                  toggle
                  label={showActive ? 'Active Events' : 'All Events'}
                  checked={showActive}
                  onChange={() => setShowActive(!showActive)}
                />
             </Form.Field>
          </Form.Group>
        </Form>
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
                    <Button color='green' size={isMobile ? 'tiny' : 'large'} style={{ position: 'absolute', right: '20px', top: '60px' }} onClick={() => {navigate('/newregistration')}}>
                        <Icon name='add' /> {isMobile ? 'New' :'Create New Event'}
                    </Button>
                </div>
                <CardGroup itemsPerRow={isMobile ? '1' : '2'} style={{padding: isMobile ? '5px' : '40px'}}>
                    {displayRegistrationEvents()
                    .filter(event => new Date(event.endDate) >= new Date() || !showActive)
                    .map((event) => (
                        <EventCard key={event.id} event={event} removeEvent={handleRemoveRegistrationEvent}/>
                    ))}
                </CardGroup>
            </Container>
        </>
    );
});
