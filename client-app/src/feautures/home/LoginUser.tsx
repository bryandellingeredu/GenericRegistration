import { Container, Header, Segment, Icon, Grid, Divider, Button } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { Login } from "@microsoft/mgt-react";
import { Providers } from "@microsoft/mgt-element";     
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import {  useEffect, useState} from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";



export default observer ( function LoginUser() {
    const {userStore} = useStore();
    const {login, signInArmy, handleGraphRedirect} = userStore;
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // Call the method from the store to handle the redirect
        handleGraphRedirect();
    }, [handleGraphRedirect]);
    
    const handleLoginCAC = async () => {
        console.log('clicking button');
        setIsLoggingIn(true);    
        try{
           await signInArmy();
        }catch(error){
            console.error('Error getting access token', error);  
        }
    }

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

                    {isLoggingIn && <LoadingComponent content='Logging in...' />}
 { !isLoggingIn &&         
<Segment color='black'  >
    <Grid columns={2} stackable textAlign='center'>
      <Divider vertical>Or</Divider>

      <Grid.Row verticalAlign='middle'>
        <Grid.Column>
          <Header icon>
            <Icon name='graduation cap' />
            Login EDU
          </Header>

          <Login  loginCompleted={loginCompleted} loginInitiated={loginInitiated}/>
        </Grid.Column>

        <Grid.Column>
          <Header icon>
            <Icon name='id badge' />
            Login CAC
          </Header>
          <Button basic onClick={handleLoginCAC}>Sign In</Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
}

                                            
                        <div className="army-logo-container">
                          <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                      </div>
                </Container>
              
            </div>
        )
})