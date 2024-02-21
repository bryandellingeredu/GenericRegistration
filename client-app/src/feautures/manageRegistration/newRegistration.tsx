import { Container, Header, Icon, Button, StepGroup, Step, StepContent, StepTitle, StepDescription } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import DetailsForm from "./detailsForm";
import QuestionsForm from "./questionsForm";
import { useParams } from 'react-router-dom';
import Confirmation from "../../app/common/modals/Confirmation";
import DesignPage from "./designPage";
import ReviewAndPublish from "./reviewAndPublish";

export default observer ( function NewRegistration() {
    const { id } = useParams();
    const [formisDirty, setFormisDirty] = useState(false);
    const handleSetFormDirty = () => setFormisDirty(true);
    const handleSetFormClean = () => setFormisDirty(false);
    const [siteTitle, setSiteTitle] = useState('Create a New Event');
    const {responsiveStore, modalStore} = useStore();
    const {isMobile} = responsiveStore
    const {openModal, closeModal} = modalStore;
    const [activeStep, setActiveStep] = useState('Details');
    const [registrationEventId, setNewRegistrationEventId] = useState('');
    const handleSetRegistrationEventId = (id: string): void  => setNewRegistrationEventId(id)
    const setActiveSteptoDetails = () : void => setActiveStep('Details');
    const setActiveSteptoQuestions = () : void => setActiveStep('Questions');
    const setActiveSteptoDesign = () : void => setActiveStep('Design');
    const setActiveSteptoPublish = () : void => setActiveStep('Publish');

    useEffect(() => {
      if(id){
        setNewRegistrationEventId(id);
        setSiteTitle('Edit Event')
      }
    }, []);

    const  handleQuestionsClick = () => {
      if(formisDirty){
        const handleYesClick = () => { handleSetFormClean(); setActiveSteptoQuestions(); closeModal();}
        openModal(<Confirmation
            title={'You have pending changes.'}
            header={'Are You sure want to leave this page?'} 
            subHeader={'If you leave this page you will lose all of your changes.'}
            onYesClick={handleYesClick }/>)
      }else{
        setActiveStep('Questions');
      }    
    }

    const handleDesignClick = () =>{
      if(formisDirty){
        const handleYesClick = () => { handleSetFormClean(); setActiveSteptoDesign(); closeModal();}
        openModal(<Confirmation
            title={'You have pending changes.'}
            header={'Are You sure want to leave this page?'} 
            subHeader={'If you leave this page you will lose all of your changes.'}
            onYesClick={handleYesClick }/>)
      }else{
        setActiveStep('Design');
      }  
    }

    const handlePublishClick = () =>{
      if(formisDirty){
        const handleYesClick = () => { handleSetFormClean(); setActiveSteptoPublish(); closeModal();}
        openModal(<Confirmation
            title={'You have pending changes.'}
            header={'Are You sure want to leave this page?'} 
            subHeader={'If you leave this page you will lose all of your changes.'}
            onYesClick={handleYesClick }/>)
      }else{
        setActiveStep('Publish');
      }  
    }

    return (
        <>
            <ManageRegistrationNavbar />
            <Container fluid style={{ color: '#333', paddingTop: '20px' }}> {/* Light grey background, dark text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Wrapper div for the Header to center it horizontally */}
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <Header as='h1' icon style={{ display: 'inline-block', margin: '0 auto', color: '#0d47a1' }}> {/* Dark blue text */}
                            <Icon name={id ? 'pencil' : 'calendar plus outline' } color='teal' /> {/* Icon color changed to teal */}
                            {siteTitle}
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
     <StepGroup size= {isMobile ? 'mini' : 'large'}  widths={4} unstackable>
    <Step active={activeStep === 'Details'} onClick={() => setActiveStep('Details')}>
      <Icon name='info' />
      <StepContent>
        <StepTitle>Details</StepTitle>
        <StepDescription>General information for the event</StepDescription>
      </StepContent>
    </Step>

    <Step disabled={!registrationEventId}  active={activeStep === 'Questions'} onClick={handleQuestionsClick}>
      <Icon name='question' />
      <StepContent>
        <StepTitle>Questions</StepTitle>
        <StepDescription>Collect information from attendees</StepDescription>
      </StepContent>
    </Step>

    <Step disabled={!registrationEventId} active={activeStep === 'Design'} onClick={handleDesignClick}>
      <Icon name='paint brush' />
      <StepContent>
        <StepTitle>Design</StepTitle>
        <StepDescription>Design your registration webpage</StepDescription>
      </StepContent>
    </Step>
    <Step disabled={!registrationEventId} active={activeStep === 'Publish'} onClick={handlePublishClick}>
      <Icon name='check' />
      <StepContent>
        <StepTitle>Publish</StepTitle>
        <StepDescription>Review your website and publish</StepDescription>
      </StepContent>
    </Step>
  </StepGroup>
  </div>  
     {activeStep === 'Details' && 
     <DetailsForm
      registrationEventId={registrationEventId}
      setRegistrationEventId={handleSetRegistrationEventId}
      setActiveStep={setActiveSteptoQuestions}
      formIsDirty={formisDirty}
      setFormDirty={handleSetFormDirty}
      setFormClean={handleSetFormClean} />}

      {activeStep === 'Questions' && 
        <QuestionsForm
        registrationEventId={registrationEventId}
        setNextActiveStep={setActiveSteptoDesign}
        setPreviousActiveStep={setActiveSteptoDetails}
        formIsDirty={formisDirty}
        setFormDirty={handleSetFormDirty}
        setFormClean={handleSetFormClean}
         />
      }
      {activeStep === 'Design' && 
        <DesignPage registrationEventId={registrationEventId}
        setNextActiveStep={setActiveSteptoPublish}
        setPreviousActiveStep={setActiveSteptoQuestions}
        formIsDirty={formisDirty}
        setFormDirty={handleSetFormDirty}
        setFormClean={handleSetFormClean} />
      }
      {activeStep === 'Publish' &&
       <ReviewAndPublish />
      }
  </Container>
        </>
    );
})
