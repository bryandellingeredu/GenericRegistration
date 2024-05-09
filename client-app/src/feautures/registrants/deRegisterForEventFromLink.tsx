import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { Button, ButtonGroup, Header, HeaderSubheader, Icon, Message, Segment, SegmentGroup } from "semantic-ui-react";


export default observer(function DeRegisterForEventFromLink() {
    const { encryptedKey } = useParams();
    const [validating, setValidating] = useState(true);
    const navigate = useNavigate();
    const { responsiveStore } = useStore();
    const {isMobile} = responsiveStore;
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [cancellingRegistration, setCancellingRegistration] = useState(false);

    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: '',
          published: true,
          public: true,
          autoApprove: true,
          autoEmail: true,
          registrationIsOpen: true,
          maxRegistrantInd: false,
          maxRegistrantNumber: '',
          certified: true,
          documentLibrary: false
        }
    );



    useEffect(() => {
        if(encryptedKey) getData();     
      }, [encryptedKey]);

      const getData = async() => {
        if (!encryptedKey) return;
        const decodedKey = decodeURIComponent(encryptedKey);
        try{
          setValidating(true);
          await agent.EmailLinks.validate(decodedKey);
          setValidating(false);
          setValidated(true);
          setLoading(true);
          const registrationEvent : RegistrationEvent = await agent.EmailLinks.getRegistrationEvent(decodedKey);
            setRegistrationEvent(registrationEvent);
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("invalid email link");
          }
        } finally {
          setValidating(false);
          setLoading(false);
        }

      }

      const handleCancelRegistration = async () => {
        setCancellingRegistration(true);
        try{
          const decodedKey = decodeURIComponent(encryptedKey!);
          await agent.EmailLinks.delete(decodedKey);
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
    
      if (validating) return <LoadingComponent content="Validating Email Link..."/>
      if (loading) return <LoadingComponent content="Loading Data..."/>

      return(
        <>
        {!validated &&
           <Message negative
           icon='exclamation mark'
           header='Not Authorized'
           content='This is an invalid registration link.'
           />
          }

          {validated && !confirmed && 
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
                    <Button type="button" color='grey' content='Go Back'  onClick={() => navigate(`/registerfromlink?key=${encodeURIComponent(encryptedKey!)}`)}/>
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

});