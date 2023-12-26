import { Container, Divider, Header, Icon, Button } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useEffect, useState } from "react";

export default function MyRegistrations() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    return(
        <>
        <ManageRegistrationNavbar  />
        <Container fluid>

            <Divider horizontal style={{ position: 'relative' }}>
                <Header as={isMobile ? 'h4' : 'h1'}>
                    <Icon name='list alternate' />
                    My Registrations
                </Header>
                <Button 
                    size={isMobile ? 'medium' : 'huge'}
                    color='teal'
                    animated='vertical' 
                    style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        right: '10px', 
                        transform: 'translateY(-50%)' 
                    }}
                >
                    <Button.Content hidden>New</Button.Content>
                    <Button.Content visible>
                        <Icon name='plus' />
                    </Button.Content>
                </Button>
            </Divider>
        </Container>
        </>
    )
}