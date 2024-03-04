import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useParams } from 'react-router-dom';
import { Button, Grid, Header, Icon, Loader, Step, StepContent, StepDescription, StepGroup, StepTitle } from 'semantic-ui-react';
import { RegistrationEvent } from '../../app/models/registrationEvent';
import { v4 as uuidv4 } from 'uuid';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import CreateUpdateReqistrationDetails from './createUpdateReqistrationDetails';
import CreateUpdateRegistrationInfo from './createUpdateRegistrationInfo';
import { RegistrationEventWebsite } from '../../app/models/registrationEventWebsite';
import { useNavigate } from "react-router-dom";
import CreateUpdateRegistrationQuestions from './createUpdateRegistrationQuestions';
import { CustomQuestion } from '../../app/models/customQuestion';
import ReviewAndPublishRegistration from './reviewAndPublishRegistration';

export default observer(function CreateUpdateRegistration() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { step } = useParams();
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [savingFromStepClick, setSavingFromStepClick] = useState(false);
    const [formisDirty, setFormisDirty] = useState(false);
    const handleSetFormDirty = () => setFormisDirty(true);
    const handleSetFormClean = () => setFormisDirty(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [activeStep, setActiveStep] = useState('Design');
    const handeSetActiveStepToDesign = () => {
      setActiveStep('Design');
    }
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: '',
          published: false,
        }  
    );
    const [registrationEventId, setRegistrationEventId] = useState(uuidv4());
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSetRegistrationEvent = (event: RegistrationEvent) =>{
        setRegistrationEvent(event);
    }

    const handleSetContent = (newContent : string) =>{
        setContent(newContent);
    }

    const handleSetCustomQuestions = (newCustomQuestions : CustomQuestion[]) => {
        setCustomQuestions(newCustomQuestions);
    }

    const handleDesignClick = () => {
      setActiveStep('Design');
    }

 

    

    useEffect(() => {
        if(id) getRegistrationEvent();     
      }, [id]);
    
      useEffect(() => {
        if(step) setActiveStep(step);     
      }, [step]);

      const getRegistrationEvent = async () => {
       
          setLoading(true);
          try{
              const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
              setRegistrationEvent(registrationEvent);
              setRegistrationEventId(registrationEvent.id);
              const registrationEventWebsite : RegistrationEventWebsite | null = await agent.RegistrationEventWebsites.details(id!);
              if(registrationEventWebsite && registrationEventWebsite) setContent(registrationEventWebsite.content)
              const customQuestionData : CustomQuestion[] = await agent.CustomQuestions.details(id!);
              if(customQuestionData && customQuestionData.length) setCustomQuestions(customQuestionData);
          }catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("An error occured loading data");
            }
          }finally {
            setLoading(false);
        }
      }

      const handleReviewClick = async() => {
        if(formisDirty){
          setSavingFromStepClick(true);
          setRegistrationEvent(prevState => ({
            ...prevState,
            id: registrationEventId
          }));

         const data = {...registrationEvent, id: registrationEventId}

         try {
          await agent.RegistrationEvents.createUpdate(data);
          await agent.RegistrationEventWebsites.createUpdate({registrationEventId, content});
          await agent.CustomQuestions.createUpdate(registrationEventId, customQuestions);
          setFormisDirty(false);
          if(!id){
            navigate(`/editregistration/${registrationEventId}/Review`)
          }  else {
            setActiveStep('Review');
          }
      } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("Save failed!");
        }
      } finally {
        setSavingFromStepClick(false);
      }

        }else{
          setActiveStep('Review');
        }
  
      }

      const handlePublish = async() => {
        try{
          setPublishing(true);
          await agent.RegistrationEvents.publish(registrationEventId);
          setRegistrationEvent(prevState => ({
            ...prevState,
            published: true
          }));
          toast.success("Publish was successful!"); 
        }catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("Published failed!");
          }
        } finally {
            setPublishing(false);
        }
      }

      const handleUnpublish = async() => {
        try{
          debugger;
          setPublishing(true);
          await agent.RegistrationEvents.unpublish(registrationEventId);
          setRegistrationEvent(prevState => ({
            ...prevState,
            published: false
          }));
          toast.success("Un Publish was successful!"); 
        }catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("Un Published failed!");
          }
        } finally {
            setPublishing(false);
        }
      }

      const saveForm = async() => {
        setFormSubmitted(true);
        let error = false;
        if (!registrationEvent.title || !registrationEvent.title.trim()) error = true;
        if (!registrationEvent.location || !registrationEvent.location.trim()) error = true;
        if(!registrationEvent.startDate  || !registrationEvent.startDate) error = true;
        if(!error){
            setSaving(true);
            setRegistrationEvent(prevState => ({
                ...prevState,
                id: registrationEventId
              }));

          const data = {...registrationEvent, id: registrationEventId}

          try {
            await agent.RegistrationEvents.createUpdate(data);
            await agent.RegistrationEventWebsites.createUpdate({registrationEventId, content});
            await agent.CustomQuestions.createUpdate(registrationEventId, customQuestions);
            toast.success("Save was successful!"); 
            setFormisDirty(false);
            if(!id)  navigate(`/editregistration/${registrationEventId}`)
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("Save failed!");
          }
        } finally {
            setSaving(false);
        }
        }
      }


      if (loading) return <LoadingComponent content="Loading Data..."/>
    return (
        <>



            <ManageRegistrationNavbar />
            <StepGroup fluid size='huge'>
    <Step active onClick={handleDesignClick}>
      <Icon name='paint brush'  />
      <StepContent>
        <StepTitle>Design</StepTitle>
        <StepDescription>Design Your Registration Form</StepDescription>
      </StepContent>
    </Step>

    <Step 
    onClick={handleReviewClick}
    disabled = {savingFromStepClick || !registrationEvent.title || !registrationEvent.title.trim() || !registrationEvent.location || !registrationEvent.location.trim() || !registrationEvent.startDate || !registrationEvent.endDate  }>
     {savingFromStepClick && <Loader active inline /> }
     {!savingFromStepClick && <Icon name='check' />} 
      <StepContent>
        <StepTitle>Review and Publish</StepTitle>
        <StepDescription>Review Your Site and Publish</StepDescription>
      </StepContent>
    </Step>
  </StepGroup>
         {activeStep === 'Design' && 
            <Grid  stackable style={{ marginTop: '20px', padding: '40px' }}>
                <Grid.Row>
                    <Grid.Column width={8}>
                    <Header as='h2' textAlign="center">
                        <Icon name='pencil' />
                            <Header.Content>
                                Event Details
                                <Header.Subheader>The Basic details of your event</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                        <CreateUpdateReqistrationDetails
                          registrationEvent={registrationEvent}
                          setRegistrationEvent={handleSetRegistrationEvent}
                          formSubmitted={formSubmitted}
                          setFormDirty={handleSetFormDirty}
         
                         />
                          
                          <Header as='h2' textAlign="center">
                        <Icon name='info' />
                            <Header.Content>
                                Event Info
                                <Header.Subheader>Enter information about your event, Overview, Agenda, Speakers etc.</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationInfo content={content} setContent={handleSetContent} setFormDirty={handleSetFormDirty}/>
                        {formisDirty && !savingFromStepClick && 
                        <Button floated='right' color='blue' basic size='huge' loading={saving} onClick={saveForm}> Save Pending Changes</Button>
                        }
                    </Grid.Column>
                    <Grid.Column width={8}>
                    <Header as='h2' textAlign="center">
                        <Icon name='question' />
                            <Header.Content>
                                Event Questions
                                <Header.Subheader>Use the add button to design questions for your form</Header.Subheader> {/* Add your subheader text here */}
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationQuestions 
                        customQuestions={customQuestions}
                        setCustomQuestions={handleSetCustomQuestions}
                        setFormDirty={handleSetFormDirty}
                        registrationEventId={registrationEventId}
                        />
                         <Button icon labelPosition='right' floated='right' color='blue' basic size='huge'
                          disabled = {savingFromStepClick || !registrationEvent.title || !registrationEvent.title.trim() || !registrationEvent.location || !registrationEvent.location.trim() || !registrationEvent.startDate || !registrationEvent.endDate  }
                          loading={savingFromStepClick}
                          onClick={handleReviewClick}
                         >
                            Review and Publish
                          <Icon name='arrow alternate circle right' />
                        </Button>
                         {formisDirty && !savingFromStepClick && 
                        <Button floated='right'
                         color='blue'
                         basic size='huge'
                         loading={saving} onClick={saveForm}> Save Pending Changes</Button>
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            }
            {activeStep === 'Review' &&
             <ReviewAndPublishRegistration 
             registrationEvent={registrationEvent}
             content={content}
             customQuestions={customQuestions}
             publish={handlePublish}
             unPublish={handleUnpublish}
             publishing={publishing}
             setActiveStep={handeSetActiveStepToDesign}
             registrationEventId={registrationEventId}/>}
        </>
    );
});
