import { Container, Header, Segment, Icon } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { Login } from "@microsoft/mgt-react";
import { Providers } from "@microsoft/mgt-element";     
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer ( function LoginUser() {
    const {userStore} = useStore();
    const {login} = userStore;
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const loginCompleted = async () => {
        setIsLoggingIn(true);
        try {
            const provider = Providers.globalProvider;
            const accessToken = await provider.getAccessToken();
           await login(accessToken);
        } catch (error) {
            console.error('Error getting access token', error);
        }
    };
 
       const loginInitiated = () => {
        setIsLoggingIn(true);
        };

        return (
            <div className="homepage-background">
                <Container fluid>
                    {/* Use "inverted" for light text and add inline styles for uppercase and size */}
                    <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3.5em' }} color='yellow' >
                        Carlisle Barricks Registration Portal
                    </Header>
                
                 
                        <Segment placeholder inverted color='black'>
                            <Header icon>
                                <Icon name='user' />
                                     Log in with your EDU Account
                            </Header>
                          
                            <Segment.Inline>
                            {!isLoggingIn && 
                                <Login 
                                    loginCompleted={loginCompleted}
                                    loginInitiated={loginInitiated}
                                />
                            }
                            {isLoggingIn && <LoadingComponent content='Logging in...' />}
                            </Segment.Inline>
                        </Segment>
                   
                                            
                        <div className="army-logo-container">
                          <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                      </div>
                </Container>
              
            </div>
        )
})