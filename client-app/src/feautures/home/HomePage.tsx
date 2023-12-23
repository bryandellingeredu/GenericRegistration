import { Container, Header, Button,  ButtonGroup } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default observer ( function HomePage() {

    const {userStore, commonStore} = useStore();
    const {isLoggedIn} = userStore
    const navigate = useNavigate()
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

   const  navigateBasedOnLoginStatus = () => {
        commonStore.setDoNotAutoLogin('true')
        if (isLoggedIn) {
            navigate('/myregistrations');
        } else {
            navigate('/login');
        }
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="homepage-background">
            <Container fluid>
                {/* Use "inverted" for light text and add inline styles for uppercase and size */}
                {!isMobile && 
                <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3.5em' }} color='yellow' >
                    Carlisle Barricks Registration Portal
                </Header>
                }
                  {isMobile && 
                <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '2em' }} color='yellow' >
                    Registration Portal
                </Header>
                }
            
              
                    <ButtonGroup size="huge" color="yellow" inverted>
                    <Button>   register for events</Button>
                    <Button onClick={navigateBasedOnLoginStatus}> manage events</Button>
                    </ButtonGroup>                                                 
                 
            </Container> 
            <div className="army-logo-container">
                      <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                  </div>     
        </div>
    )
} ) 