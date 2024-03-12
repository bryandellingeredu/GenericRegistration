import { Container, Header, Segment, Icon, Grid, Divider, Button } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { Login } from "@microsoft/mgt-react";
import { Providers } from "@microsoft/mgt-element";     
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import {  useEffect, useState} from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useNavigate } from "react-router-dom";



export default observer ( function LoginUser() {
    const {userStore, commonStore} = useStore();
    const {login, signInArmy,  handleGraphRedirect} = userStore;
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const {responsiveStore} = useStore();
    const {isMobile} = responsiveStore
    const {redirectToPage} = commonStore;
    const navigate = useNavigate();



    useEffect(() => {
        // Call the method from the store to handle the redirect
        handleGraphRedirect();
    }, [handleGraphRedirect]);
    
    const handleLoginCAC = async () => {
        setIsLoggingIn(true);
        commonStore.setDoNotAutoLogin(null);    
        try{
           await signInArmy();
        }catch(error){
            console.error('Error getting access token', error);  
        }
    }



    const loginCompleted = async () => {
        debugger;
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
      
        const handleSendLink = () => {
          if(redirectToPage && redirectToPage.toLocaleLowerCase().includes('registerforevent')){
            const guid = redirectToPage.split('/').pop();
            if (guid) navigate(`/sendemaillink/${guid}`);
          }
        }

        return (
            <div className="homepage-background">
                <Container fluid>
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

                    {isLoggingIn && <LoadingComponent content='Logging in...' />}

 { !isLoggingIn &&  !isMobile &&         
<Segment color='black'  >
    <Grid columns={(redirectToPage && redirectToPage.toLocaleLowerCase().includes('registerforevent')) ? 3 : 2 } stackable textAlign='center'>
      {!redirectToPage && <Divider vertical>Or</Divider>}

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
       {redirectToPage && redirectToPage.toLocaleLowerCase().includes('registerforevent') &&
          <Grid.Column>
          <Header icon>
            <Icon name='envelope' />
            Email Link
          </Header>

          <Button basic onClick={handleSendLink}>Send Link</Button>
     
        </Grid.Column>
        }

      </Grid.Row>
    </Grid>
  </Segment>
}

{ !isLoggingIn &&  isMobile && 
 <Segment color='black'  >
    <Grid columns={(redirectToPage && redirectToPage.toLocaleLowerCase().includes('registerforevent')) ? 2 : 1 } stackable textAlign='center'>


   <Grid.Row verticalAlign='middle'>
     <Grid.Column>
       <Header icon>
         <Icon name='graduation cap' />
         Login EDU
       </Header>

      <Login  loginCompleted={loginCompleted} loginInitiated={loginInitiated}/>
     </Grid.Column>
     {redirectToPage && redirectToPage.toLocaleLowerCase().includes('registerforevent') &&
          <Grid.Column>
          <Header icon>
            <Icon name='envelope' />
            Email Link
          </Header>
          <Button basic onClick={handleSendLink}>Send Link</Button>   
        </Grid.Column>
        }
   </Grid.Row>
 </Grid>
</Segment>
}

                                            

  </Container>
  <div className="army-logo-container">
                      <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                  </div>  
              
   </div>
        )
})