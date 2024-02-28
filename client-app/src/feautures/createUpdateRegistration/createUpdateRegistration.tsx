import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useParams } from 'react-router-dom';
import { Button, Grid, Header, Icon } from 'semantic-ui-react';
import { RegistrationEvent } from '../../app/models/registrationEvent';
import { v4 as uuidv4 } from 'uuid';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import CreateUpdateReqistrationDetails from './createUpdateReqistrationDetails';
import CreateUpdateRegistrationInfo from './createUpdateRegistrationInfo';
import { RegistrationEventWebsite } from '../../app/models/registrationEventWebsite';
import { useNavigate } from "react-router-dom";

export default observer(function CreateUpdateRegistration() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false)
    const [formisDirty, setFormisDirty] = useState(false);
    const handleSetFormDirty = () => setFormisDirty(true);
    const handleSetFormClean = () => setFormisDirty(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: ''
        }  
    );
    const [loading, setLoading] = useState(false);

    const handleSetRegistrationEvent = (event: RegistrationEvent) =>{
        setRegistrationEvent(event);
    }

    const handleSetContent = (newContent : string) =>{
        setContent(newContent);
    }
    useEffect(() => {
        if(id) getRegistrationEvent();     
      }, [id]);

      const getRegistrationEvent = async () => {
       
          setLoading(true);
          try{
              const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
              setRegistrationEvent(registrationEvent);
              const registrationEventWebsite : RegistrationEventWebsite | null = await agent.RegistrationEventWebsites.details(id!);
              if(registrationEventWebsite && registrationEventWebsite) setContent(registrationEventWebsite.content)
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

      const saveForm = async() => {
        setFormSubmitted(true);
        let error = false;
        if (!registrationEvent.title || !registrationEvent.title.trim()) error = true;
        if (!registrationEvent.location || !registrationEvent.location.trim()) error = true;
        if(!registrationEvent.startDate  || !registrationEvent.startDate) error = true;
        if(!error){
            setSaving(true);
            const registrationEventId = id || registrationEvent.id || uuidv4();
            setRegistrationEvent(prevState => ({
                ...prevState,
                id: registrationEventId
              }));

          const data = {...registrationEvent, id: registrationEventId}

          try {
            await agent.RegistrationEvents.createUpdate(data);
            await agent.RegistrationEventWebsites.createUpdate({registrationEventId, content});
            toast.success("Save was successful!"); 
            setFormisDirty(false);
            if(!id)  navigate(`/editregistration/${registrationEventId}`)
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("Save failed!");
          }
        } finally {
            setSaving(false);
        }
        }
      }


      if (loading) return <LoadingComponent content="Loading Data..."/>
    return (
        <>
            <ManageRegistrationNavbar />
            <Grid container stackable style={{ marginTop: '20px' }}>
                <Grid.Row>
                    <Grid.Column width={8}>
                    <Header as='h2' textAlign="center">
                        <Icon name='pencil' />
                            <Header.Content>
                                Event Details
                                <Header.Subheader>The Basic details of your event</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                        <CreateUpdateReqistrationDetails
                          registrationEvent={registrationEvent}
                          setRegistrationEvent={handleSetRegistrationEvent}
                          formSubmitted={formSubmitted}
                          setFormDirty={handleSetFormDirty}
         
                         />
                          <Header as='h2' textAlign="center">
                        <Icon name='info' />
                            <Header.Content>
                                Event Info
                                <Header.Subheader>Enter information about your event, Overview, Agenda, Speakers etc.</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationInfo content={content} setContent={handleSetContent} setFormDirty={handleSetFormDirty}/>
                        {formisDirty && 
                        <Button floated='right' color='blue' basic size='huge' loading={saving} onClick={saveForm}> Save Pending Changes</Button>
                        }
                    </Grid.Column>
                    <Grid.Column width={8}>
                    <Header as='h2' textAlign="center">
                        <Icon name='question' />
                            <Header.Content>
                                Event Questions
                                <Header.Subheader>Use the add button to design questions for your form</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </>
    );
});
