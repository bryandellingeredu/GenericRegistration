import { Container, Header, Button,  ButtonGroup } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";

export default observer ( function HomePage() {

    const {userStore} = useStore();
    const {isLoggedIn} = userStore

    return (
        <div className="homepage-background">
            <Container fluid>
                {/* Use "inverted" for light text and add inline styles for uppercase and size */}
                <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3.5em' }} color='yellow' >
                    Carlisle Barricks Registration Portal
                </Header>
            
              
                    <ButtonGroup size="huge" color="yellow" inverted>
                    <Button>   register for events</Button>
                    <Button as={NavLink} to={isLoggedIn ? '/createRegistrationForm' : '/login'}> manage events</Button>
                    </ButtonGroup>                                                 
                    <div className="army-logo-container">
                      <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                  </div>
            </Container>      
        </div>
    )
} ) 