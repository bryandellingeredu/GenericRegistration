import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import { RegistrationEvent, RegistrationEventFormValues } from "../../app/models/registrationEvent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { RegistrationLink } from "../../app/models/registrationLink";
import { Button, ButtonGroup, Header, HeaderSubheader, Icon, Menu, Message, Segment, SegmentGroup } from "semantic-ui-react";
import ArmyLogo from "../home/ArmyLogo";

export default observer(function ThankYouForRegisteringFromLink() {

    const { encryptedKey } = useParams();
    const [validating, setValidating] = useState(true);
    const navigate = useNavigate();
    const { responsiveStore } = useStore();
    const {isMobile} = responsiveStore
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState('');
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(new RegistrationEventFormValues());

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
            const registrationLink : RegistrationLink = await agent.EmailLinks.getRegistrationLink(decodedKey);
            setEmail(registrationLink.email);
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
            {validated &&
            <>
             <Menu inverted color='black'  widths='2'>
              <Menu.Item>
                <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
            </Menu.Item>
            {!isMobile && 
            <Menu.Item>
              <Header as='h4' inverted>
                <Icon name='user' color='teal'/>
                  <Header.Content>
                    {email}
                  </Header.Content>
              </Header> 
            </Menu.Item>
            }
          </Menu>
          <SegmentGroup style={{padding: '40px'}}>
<Segment color='teal'>
<Header as='h2' icon textAlign="center">
<Icon name='thumbs up' />
  Thank Your for Registering for {registrationEvent.title}
  <HeaderSubheader>
    A confirmation has been sent to your email. Please check your inbox (and the spam folder, just in case).
  </HeaderSubheader>
</Header>
<HeaderSubheader style={{ marginTop: '20px', textAlign: 'center' }}>
    You may safely close this page.
</HeaderSubheader>
</Segment>
<Segment color='teal' clearing>
<ButtonGroup size={isMobile ? 'tiny': 'huge'} floated="right">
   <Button type='button' primary content='Back To Registration' onClick={() => navigate(`/registerfromlink?key=${encodeURIComponent(encryptedKey!)}`)} />
   <Button type='button' secondary content='View Events' onClick={() => navigate('/viewallevents')} />
</ButtonGroup>
</Segment>

</SegmentGroup>
            </>
            }
        </>
      )
})