import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Registration } from "../../app/models/registration";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, ButtonGroup, Header, HeaderSubheader, Icon, Segment, SegmentGroup } from "semantic-ui-react";

export default observer(function DeRegisterForEvent() {
    const navigate = useNavigate();
    const { userStore, responsiveStore } = useStore();
    const {isMobile} = responsiveStore
    const { user } = userStore;
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [cancellingRegistration, setCancellingRegistration] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: '',
          published: true,
        }  
    );
    const [registration, setRegistration] = useState<Registration>({
        id: '',
        registrationEventId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        registrationDate: new Date(),
        registered: false,
        }
      )

      useEffect(() => {
        if(id && user) getData();     
      }, [id, user]);

      const handleCancelRegistration = async () => {
        setCancellingRegistration(true);
        try{
          await agent.Registrations.delete(registration.id);
          setConfirmed(true);
         }catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("An error occured loading data");
          }
        }finally {
            setCancellingRegistration(false);
      }
      }

      const getData = async () => {
        setLoading(true);
        try{
          const registrationData : Registration = await agent.Registrations.details(id!);
          setRegistration(registrationData);
            const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(registrationData.registrationEventId);
            setRegistrationEvent(registrationEvent);
          
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

      if (loading) return <LoadingComponent content="Loading Data..."/>

  return(
    <>
    {!confirmed && 
     <SegmentGroup style={{padding: '40px'}}>
        <Segment color='teal'>
        <Header as='h2' icon textAlign="center">
            <Icon name='remove user' />
        Cancel Your Registration
        <HeaderSubheader>
            Are you sure you want to cancel your registration for {registrationEvent.title}?
        </HeaderSubheader>
        </Header>
        </Segment>
        <Segment clearing color='teal'>
          <ButtonGroup floated="right" size={isMobile ? 'tiny' : 'huge'}>
             <Button type="button" color='grey' content='Go Back' onClick={() => navigate(`/registerforevent/${registrationEvent.id}`)}/>
             <Button type="button"
              primary content='Cancel My Registration'
              onClick={handleCancelRegistration}
              loading={cancellingRegistration}
               />
          </ButtonGroup>
        </Segment>
     </SegmentGroup>
    }
    {confirmed &&
   <SegmentGroup style={{padding: '40px'}}>
   <Segment color='teal'>
     <Header as='h2' icon textAlign="center">
       <Icon name='calendar times outline' />
       Registration Cancellation Confirmed
       <HeaderSubheader>
         Your registration for {registrationEvent.title} has been successfully canceled.
       </HeaderSubheader>
     </Header>
     <HeaderSubheader style={{ marginTop: '20px', textAlign: 'center' }}>
       If you change your mind, check back for future events.
     </HeaderSubheader>
   </Segment>
   <Segment color='teal' clearing>
     <ButtonGroup size={isMobile ? 'tiny': 'huge'} floated="right">
       <Button type='button' secondary content='View More Events' onClick={() => navigate('/viewallevents')} />
     </ButtonGroup>
   </Segment>
 </SegmentGroup>
    }
    </>
  )
})