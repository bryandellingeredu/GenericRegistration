import { Container, Header, Icon, Button, StepGroup, Step, StepContent, StepTitle, StepDescription } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import DetailsForm from "./detailsForm";
import QuestionsForm from "./questionsForm";

export default observer ( function NewRegistration() {
    const {responsiveStore} = useStore();
    const {isMobile} = responsiveStore
    const [activeStep, setActiveStep] = useState('Details');
    const [registrationEventId, setNewRegistrationEventId] = useState('');
    const handleSetRegistrationEventId = (id: string): void  => setNewRegistrationEventId(id)
    const setActiveSteptoQuestions = () : void => setActiveStep('Questions');
    return (
        <>
            <ManageRegistrationNavbar />
            <Container fluid style={{ color: '#333', paddingTop: '20px' }}> {/* Light grey background, dark text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Wrapper div for the Header to center it horizontally */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <Header as='h1' icon style={{ display: 'inline-block', margin: '0 auto', color: '#0d47a1' }}> {/* Dark blue text */}
                            <Icon name='calendar plus outline' color='teal' /> {/* Icon color changed to teal */}
                            Create a New Event
                            <Header.Subheader style={{ color: '#666' }}> {/* Lighter text for the subheader */}
                            {!isMobile && 
                                <h3>Plan your event by filling out the form. Provide details about your class, symposium, or event to help participants register and prepare.</h3>
                            }
                            {isMobile && 
                              <h3>Plan your event by filling out the form</h3>
                            }
                            </Header.Subheader>
                        </Header>
                    </div>
                    {/* Button removed from this view to avoid confusion, assuming form submission is handled within the form itself */}
                </div>
    <div style={{
    width: '100%', 
    paddingLeft: isMobile ? '0px' : '40px', 
    paddingRight: isMobile ? '0px' : '40px'
}}>  
     <StepGroup size= {isMobile ? 'mini' : 'large'}  widths={3} unstackable>
    <Step active={activeStep === 'Details'} onClick={() => setActiveStep('Details')}>
      <Icon name='info' />
      <StepContent>
        <StepTitle>Details</StepTitle>
        <StepDescription>General information for the event</StepDescription>
      </StepContent>
    </Step>

    <Step disabled={!registrationEventId}  active={activeStep === 'Questions'}>
      <Icon name='question' />
      <StepContent>
        <StepTitle>Questions</StepTitle>
        <StepDescription>Collect information from attendees</StepDescription>
      </StepContent>
    </Step>

    <Step disabled={!registrationEventId}>
      <Icon name='paint brush' />
      <StepContent>
        <StepTitle>Design</StepTitle>
        <StepDescription>Design your registration webpage</StepDescription>
      </StepContent>
    </Step>
  </StepGroup>
  </div>  
     {activeStep === 'Details' && 
     <DetailsForm
      registrationEventId={registrationEventId}
      setRegistrationEventId={handleSetRegistrationEventId}
      setActiveStep={setActiveSteptoQuestions} />}

      {activeStep === 'Questions' && 
        <QuestionsForm />
      }
  </Container>
        </>
    );
})