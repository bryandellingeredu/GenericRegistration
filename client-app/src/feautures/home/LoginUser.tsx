import { Container, Header, Button } from "semantic-ui-react";
import ArmyLogo from "./ArmyLogo";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function LoginUser() {
    const { userStore } = useStore();
    const { signIn } = userStore;
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signIn();
        } catch (error) {
            console.error('Error during login', error);
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="homepage-background">
            <Container fluid textAlign='center'>
                <Header as='h1' textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3em' }} color='yellow'>
                    Carlisle Barricks Registration Portal
                </Header>

                {isLoggingIn && <LoadingComponent content='Logging in...' />}

                {!isLoggingIn && 
                    <Button primary size='large' onClick={handleLogin}>
                        Sign In
                    </Button>
                }

                <div className="army-logo-container">
                    <ArmyLogo content={'U.S. ARMY'} size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                </div>
            </Container>
        </div>
    )
})
