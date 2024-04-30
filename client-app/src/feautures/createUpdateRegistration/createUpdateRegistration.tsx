import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, Grid, Header, Icon, Loader, Step, StepContent, StepDescription, StepGroup, StepTitle } from 'semantic-ui-react';
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
import { RegistrationEventOwner } from '../../app/models/registrationEventOwner';
import CreateUpdateRegistrationOwners from './createUpdateRegistrationOwners';
import CreateUpdateRegistrationSettings from './createUpdateRegistrationSettings';
import { Registration } from '../../app/models/registration';
import HeaderSubHeader from 'semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader';
import Tree from '../documentLibrary/tree';
import { Node } from '../../app/models/Node';
import { useStore } from "../../app/stores/store";
import { reaction } from 'mobx';

const baseUrl = import.meta.env.VITE_BASE_URL;

export default observer(function CreateUpdateRegistration() {
    const { documentLibraryStore } = useStore();
    const {getTreeData, TreeDataRegistry} = documentLibraryStore;
    const navigate = useNavigate();
    const { id } = useParams();
    const { step } = useParams();
    const [content, setContent] = useState('');
    const [treeData, setTreeData] = useState<Node[]>([]);
    const [documentLibraryContent, setDocumentLibraryContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [savingFromStepClick, setSavingFromStepClick] = useState(false);
    const [formisDirty, setFormisDirty] = useState(false);
    const handleSetFormDirty = () => setFormisDirty(true);
    const handleSetFormClean = () => setFormisDirty(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [activeStep, setActiveStep] = useState('Design');
    const [registeredUsersIndicator, setRegisteredUsersIndicator] = useState(false);
    const handeSetActiveStepToDesign = () => {
      setActiveStep('Design');
    }
    
    const handleSetActiveStepToDocument = () => {
      setActiveStep('Document');
      setLoadTreeData(true);
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
          autoApprove: true,
          autoEmail: true,
          documentLibrary: false,
          registrationIsOpen: true,
          public: true,
          registrations: [],
          certified: false
        }  
    );
    const [registrationEventId, setRegistrationEventId] = useState(uuidv4());
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
    const [registrationEventOwners, setRegistrationEventOwners] = useState<RegistrationEventOwner[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadTreeData, setLoadTreeData] = useState(false);

    const handleSetRegistrationEvent = (event: RegistrationEvent) =>{
        setRegistrationEvent(event);
    }

    const handleSetRegistrationEventOwners = (newRegistrationEventOwners: RegistrationEventOwner[]) =>{
      setRegistrationEventOwners(newRegistrationEventOwners);
    }

    const handleSetContent = (newContent : string) =>{
        setContent(newContent);
    }

    const handleSetDocumentLibraryContent = (newContent: string) =>{
      setDocumentLibraryContent(newContent)
    }

    const handleSetCustomQuestions = (newCustomQuestions : CustomQuestion[]) => {
        setCustomQuestions(newCustomQuestions);
    }

    const handleDesignClick = () => {
      setActiveStep('Design');
    }

    useEffect(() => {
      if (loadTreeData) {
          documentLibraryStore.fetchAndStoreTreeData(registrationEventId);
      }
  }, [loadTreeData, registrationEventId, documentLibraryStore]);

  useEffect(() => {
    const disposer = reaction(
        () => documentLibraryStore.TreeDataRegistry.get(registrationEventId),
        (data) => {
            if (data) {
                setTreeData(data);
            }
        }
    );

    // Cleanup the reaction when the component unmounts
    return () => disposer();
}, [registrationEventId, documentLibraryStore]);

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
              if(registrationEventWebsite) setContent(registrationEventWebsite.content)
              const customQuestionData : CustomQuestion[] = await agent.CustomQuestions.details(id!);

              const documentUploadWebsite : RegistrationEventWebsite | null = await agent.DocumentUploadWebsites.details(id!);
              if(documentUploadWebsite) setDocumentLibraryContent(documentUploadWebsite.content);

              if(customQuestionData && customQuestionData.length) setCustomQuestions(customQuestionData);
              const registrationEventOwnersData : RegistrationEventOwner[] = await agent.RegistrationEventOwners.list(id!);
              if(registrationEventOwnersData && registrationEventOwnersData.length) setRegistrationEventOwners(registrationEventOwnersData);
              const registrations : Registration[] = await agent.Registrations.list(registrationEvent.id)
              if (registrations && registrations.length) setRegisteredUsersIndicator(true);
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

      const handleDocumentLibraryClick = async() => {
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
            handleSetActiveStepToDocument();
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
          handleSetActiveStepToDocument();
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
          await agent.DocumentUploadWebsites.createUpdate({registrationEventId, content: documentLibraryContent});
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

      const saveFormInBackground = async() => {
        if(id){
        let error = false;
        if (!registrationEvent.title || !registrationEvent.title.trim()) error = true;
        if (!registrationEvent.location || !registrationEvent.location.trim()) error = true;
        if(!registrationEvent.startDate  || !registrationEvent.startDate) error = true;
        if(!registrationEvent.certified) error = true;
        if(!error){
            setRegistrationEvent(prevState => ({
                ...prevState,
                id: registrationEventId
              }));

          const data = {...registrationEvent, id: registrationEventId}

          try {
            await agent.RegistrationEvents.createUpdate(data);
            await agent.RegistrationEventWebsites.createUpdate({registrationEventId, content});
            await agent.DocumentUploadWebsites.createUpdate({registrationEventId, content: documentLibraryContent});
            if(!registeredUsersIndicator) await agent.CustomQuestions.createUpdate(registrationEventId, customQuestions);
            await agent.RegistrationEventOwners.createUpdate(registrationEventId, registrationEventOwners); 
            setFormisDirty(false);
        } catch (e: any) {
          console.log(e);
          if (error && e.message) {
            toast.error("An error occurred: " + e.message);
          } else {
            toast.error("Save failed!");
          }
        } 
        }
      }
    }

      const saveForm = async() => {
        setFormSubmitted(true);
        let error = false;
        if (!registrationEvent.title || !registrationEvent.title.trim()) error = true;
        if (!registrationEvent.location || !registrationEvent.location.trim()) error = true;
        if(!registrationEvent.startDate  || !registrationEvent.startDate) error = true;
        if(!registrationEvent.certified) error = true;
        if(error) window.scrollTo(0,0);
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
            if(!registeredUsersIndicator) await agent.CustomQuestions.createUpdate(registrationEventId, customQuestions);
            await agent.RegistrationEventOwners.createUpdate(registrationEventId, registrationEventOwners);
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

      const copyLink = () => {
        const websiteUrl = `${baseUrl}/documentlibraryforevent/${registrationEventId}`;
        navigator.clipboard.writeText(websiteUrl).then(() => {
          // Optionally, show a notification or message indicating the link was copied
          toast.success("Link copied to clipboard!");
        }).catch(err => {
          toast.error('Could not copy link: ', err);
        });
      };


      if (loading) return <LoadingComponent content="Loading Data..."/>
    return (
        <>
            <ManageRegistrationNavbar />

            <StepGroup fluid size='huge'>
               <Step active={activeStep === 'Design'} onClick={handleDesignClick}>
                <Icon name='paint brush'  />
                 <StepContent>
                   <StepTitle>Design</StepTitle>
                   <StepDescription>Design Your Registration Form</StepDescription>
                </StepContent>
              </Step>

             <Step  onClick={handleReviewClick} active={activeStep === 'Review'}
                    disabled = {savingFromStepClick || !registrationEvent.title || !registrationEvent.title.trim() || !registrationEvent.location || !registrationEvent.location.trim() || !registrationEvent.startDate || !registrationEvent.endDate || !registrationEvent.certified  }>
                    {savingFromStepClick && <Loader active inline /> }
                    {!savingFromStepClick && <Icon name='check' />} 
                   <StepContent>
                      <StepTitle>Review and Publish</StepTitle>
                     <StepDescription>Review Your Site and Publish</StepDescription>
                  </StepContent>
             </Step>
             {registrationEvent.documentLibrary && 
             <Step onClick={handleDocumentLibraryClick} active={activeStep === 'Document'}
             disabled = {savingFromStepClick || !registrationEvent.title || !registrationEvent.title.trim() || !registrationEvent.location || !registrationEvent.location.trim() || !registrationEvent.startDate || !registrationEvent.endDate || !registrationEvent.certified  }>
                 {savingFromStepClick && <Loader active inline /> }
                {!savingFromStepClick && <Icon name='folder open' /> }
                 <StepContent>
                   <StepTitle>Document Library</StepTitle>
                   <StepDescription>Create a document library for your registrants</StepDescription>
                </StepContent>
              </Step>
             }


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
                                <Header.Subheader>Enter information about your event, Overview, Agenda, Speakers etc.</Header.Subheader> 
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationInfo content={content} setContent={handleSetContent} setFormDirty={handleSetFormDirty}/>

                        <Header as='h2' textAlign="center">
                        <Icon name='user plus' />
                            <Header.Content>
                                Additional Event Administrators
                                <Header.Subheader>Enter additional administrators for this event</Header.Subheader> 
                                <Header.Subheader>Pro Tip! If you logged in with your Edu account add your .Mil account here</Header.Subheader> 
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationOwners
                        registrationEventOwners={registrationEventOwners}
                        setRegistrationEventOwners={handleSetRegistrationEventOwners}
                        registrationEventId={registrationEventId}
                        setFormDirty={handleSetFormDirty} 
                        saveFormInBackground={saveFormInBackground}
                         />

                      <Header as='h2' textAlign="center">
                      <Icon name='settings' />
                      <Header.Content>
                          Settings
                           <Header.Subheader>
                              Configure your event
                            </Header.Subheader> 
                          </Header.Content>
                      </Header>
                      <CreateUpdateRegistrationSettings
                        registrationEvent={registrationEvent}
                        setRegistrationEvent={handleSetRegistrationEvent}
                        setFormDirty={handleSetFormDirty}
                        saveFormInBackground={saveFormInBackground}
                       />

                        {formisDirty && !savingFromStepClick && 
                        <Button floated='right' color='blue' basic size='huge' loading={saving} onClick={saveForm}> Save Pending Changes</Button>
                        }
                    </Grid.Column>
                    <Grid.Column width={8}>
                    <Header as='h2' textAlign="center">
                        <Icon name='question' />
                            <Header.Content>
                                Event Questions
                                <Header.Subheader>
                                  {registeredUsersIndicator ? 'People have already registred for your event you MAY NOT change questions' : 'Use the add button to design questions for your form'}
                                  </Header.Subheader> 
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationQuestions 
                        customQuestions={customQuestions}
                        setCustomQuestions={handleSetCustomQuestions}
                        setFormDirty={handleSetFormDirty}
                        registrationEventId={registrationEventId}
                        registeredUsersIndicator={registeredUsersIndicator}
                        />
                         <Button icon labelPosition='right' floated='right' color='blue' basic size='huge'
                          disabled = {savingFromStepClick || !registrationEvent.title || !registrationEvent.title.trim() || !registrationEvent.location || !registrationEvent.location.trim() || !registrationEvent.startDate || !registrationEvent.endDate || !registrationEvent.certified  }
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

            {activeStep === 'Document' && 
                <>
                <Header as={'h2'} textAlign='center'>
                Optional Document Library Creation
                   <HeaderSubHeader>
                   Create content and upload documents for registered participants to use during the event
                   </HeaderSubHeader>
                </Header>
                <Grid  stackable style={{ marginTop: '20px', padding: '40px' }}>
                    <Grid.Row>
                      <Grid.Column width={8}>
                      <Header as='h2' textAlign="center">
                        <Icon name='info' />
                            <Header.Content>
                                Document Library Instructions
                                <Header.Subheader>Create a description and instructions for your document library.
                                </Header.Subheader> 
                             </Header.Content>
                        </Header>
                        <CreateUpdateRegistrationInfo content={documentLibraryContent} setContent={handleSetDocumentLibraryContent} setFormDirty={handleSetFormDirty}/>
                        {formisDirty && !savingFromStepClick && 
                        <Button floated='right' color='blue' basic size='huge' loading={saving} onClick={saveForm} style={{marginTop: '10px'}}> Save Pending Changes</Button>
                        }
                        </Grid.Column>
                        <Grid.Column width={8}>
                        <Header as='h2' textAlign="center">
                        <Icon name='book' />
                            <Header.Content>
                                Document Library
                                <Header.Subheader>Upload documents into folders and subfolders
                                </Header.Subheader> 
                             </Header.Content>
                        </Header>
                        <Tree treeData = {treeData} registrationEventId = {registrationEventId} isAdmin = {false} />
                        <ButtonGroup size='huge' floated='right' style={{marginRight: '40px'}} >
                          <Button  primary content='Copy Docment Library Link to Clipboard' floated='right' onClick={copyLink} />
                        </ButtonGroup>
                       </Grid.Column>
                    </Grid.Row>
                </Grid>
                </>
            }
        </>
    );
});
