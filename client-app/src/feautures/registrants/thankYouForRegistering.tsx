import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { Button, ButtonGroup, Dropdown, Header, HeaderSubheader, Icon, Menu, Segment, SegmentGroup } from "semantic-ui-react";
import ArmyLogo from "../home/ArmyLogo";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function ThankYouForRegistering() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { userStore, responsiveStore } = useStore();
    const {isMobile} = responsiveStore
    const { user, logout } = userStore;
    const [loading, setLoading] = useState(true);
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
    if(id && user) getRegistrationEvent();     
  }, [id, user]);

  const getRegistrationEvent = async () => {
    setLoading(true);
    try{
        const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
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
  <Menu inverted color='black'  widths='2'>
  <Menu.Item>
  <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
  </Menu.Item>
  
  {user && !isMobile &&
     <Menu.Item>
  <Dropdown trigger={
  <>
    <Icon name="user" />
     {user?.displayName}
     </>
  }>
            <Dropdown.Menu>
              <Dropdown.Item icon="power" text="Logout" onClick={logout} />
            </Dropdown.Menu>
          </Dropdown>
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
   <Button type='button' primary content='Back To Registration' onClick={() => navigate(`/registerforevent/${id}`)} />
   <Button type='button' secondary content='View Events' onClick={() => navigate('/viewallevents')} />
</ButtonGroup>
</Segment>

</SegmentGroup>
</>
      )
})