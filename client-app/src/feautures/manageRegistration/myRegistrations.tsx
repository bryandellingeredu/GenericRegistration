import { Container, Header, Icon, Button } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useNavigate } from "react-router-dom";


export default function MyRegistrations() {
    const navigate = useNavigate();
    return (
        <>
            <ManageRegistrationNavbar />
            <Container fluid style={{ color: '#333', paddingTop: '20px' }}> {/* Light grey background, dark text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Wrapper div for the Header to center it horizontally */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <Header as='h1' icon style={{ display: 'inline-block', margin: '0 auto', color: '#0d47a1' }}> {/* Dark blue text */}
                            <Icon name='calendar check outline' color='teal' /> {/* Icon color changed to red */}
                            Manage Your Registrations
                            <Header.Subheader style={{ color: '#666' }}> {/* Lighter text for the subheader */}
                                <h3>Edit your events or create new ones. Organize your upcoming classes, symposiums, and registration-required activities.</h3>
                            </Header.Subheader>
                        </Header>
                    </div>
                    <Button color='green' size='large' style={{ position: 'absolute', right: '20px', top: '60px' }} onClick={() => {navigate('/newregistration')}}>
                        <Icon name='add' /> Create New Event
                    </Button>
                </div>
            </Container>
        </>
    );
}
