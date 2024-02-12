import { observer } from "mobx-react-lite";
import { Container, Header, Message, Icon, Button } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";

export default observer(function LoginError() {
    const navigate = useNavigate();
    const {responsiveStore} = useStore();
    const {isMobile} = responsiveStore


    return (
        <div className="homepage-background">
            <Container fluid>
                {!isMobile && 
                <Header as='h1' textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3.5em' }} color='yellow'>
                    Carlisle Barricks Registration Portal
                </Header>}
                {isMobile && 
                <Header as='h1' textAlign='center' style={{ textTransform: 'uppercase', fontSize: '2em' }} color='yellow'>
                    Registration Portal
                </Header>}
                <div style={{ margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <Message negative icon style={{ fontSize: '1.5em' }}> {/* Adjusted for larger text */}
                    <Icon name='exclamation triangle' size='huge' /> {/* Large exclamation icon */}
                    <Message.Content>
                        <Message.Header>Error Logging In</Message.Header>
                        <p>There was a problem with your login attempt.</p>
                        <Button color='red' onClick={() => navigate('/login')}>Please try again</Button>
                    </Message.Content>
                </Message>   
                </div>                                            
            </Container> 
            <div className="army-logo-container">
                <ArmyLogo content={'U.S. ARMY'} size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
            </div>     
        </div>
    );
});
