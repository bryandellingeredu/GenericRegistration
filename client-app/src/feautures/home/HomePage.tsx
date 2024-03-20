import { Container, Header, Button,  ButtonGroup } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default observer ( function HomePage() {

    const {userStore, commonStore, responsiveStore} = useStore();
    const {isLoggedIn} = userStore
    const navigate = useNavigate()
    const {isMobile} = responsiveStore
    const {redirectToPage, setDoNotAutoLogin, setRedirectToPage, setLoginType} = commonStore;

    useEffect(() => {
        // Call the method from the store to handle the redirect
        if (redirectToPage){
            if (isLoggedIn) {
                const redirect = redirectToPage;
                setRedirectToPage(null);
                setLoginType(null);
                navigate(`/${redirect}`)
            }else{
                navigate('/login');
            }
        }
    }, []);

   const  navigateBasedOnLoginStatus = () => {
        setDoNotAutoLogin('true')
        if (isLoggedIn) {
            if(redirectToPage){
                const redirect = redirectToPage;
                setRedirectToPage(null);
                navigate(`/${redirect}`)
            }else{
                navigate('/myregistrations');
            }
        } else {
            navigate('/login');
        }
    }


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
                    <Button onClick={() => navigate('/viewallevents')}>   register for events</Button>
                    <Button onClick={navigateBasedOnLoginStatus}> manage events</Button>
                    </ButtonGroup>                                                 
                 
            </Container> 
            <div className="army-logo-container">
                      <ArmyLogo content={'U.S. ARMY'}  size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                  </div>     
        </div>
    )
} ) 