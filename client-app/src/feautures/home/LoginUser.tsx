import { Container, Header, Segment, Icon } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { Login } from "@microsoft/mgt-react";
import agent from "../../app/api/agent";
import { Providers } from "@microsoft/mgt-element";     
import { User } from "../../app/models/user";

export default function LoginUser() {

    const loginCompleted = async () => {
        console.log('login completed');
        try {
            const provider = Providers.globalProvider;
            const accessToken = await provider.getAccessToken();
            const user : User  =  await agent.Account.login(accessToken);
            debugger;
            console.log(user);
        } catch (error) {
            console.error('Error getting access token', error);
        }
    };
 
       const loginInitiated = () => {
         console.log('login initiated')
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
                                <Login 
                                    loginCompleted={loginCompleted}
                                    loginInitiated={loginInitiated}
                                />
                            </Segment.Inline>
                        </Segment>
                   
                                            
                        <div className="army-logo-container">
                          <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                      </div>
                </Container>
              
            </div>
        )
}