import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ManageRegistrationNavbar from '../../app/layout/ManageRegistrationNavbar';
import { useParams } from 'react-router-dom';
import {
  Icon,
  Loader,
  Step,
  StepContent,
  StepDescription,
  StepGroup,
  StepTitle,
} from 'semantic-ui-react';
import {
  RegistrationEvent,
  RegistrationEventFormValues,
} from '../../app/models/registrationEvent';
import { v4 as uuidv4 } from 'uuid';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { RegistrationEventWebsite } from '../../app/models/registrationEventWebsite';
import { useNavigate } from 'react-router-dom';
import { CustomQuestion } from '../../app/models/customQuestion';
import ReviewAndPublishRegistration from './reviewAndPublishRegistration';
import { RegistrationEventOwner } from '../../app/models/registrationEventOwner';
import { Registration } from '../../app/models/registration';
import { Node } from '../../app/models/Node';
import { useStore } from '../../app/stores/store';
import { reaction } from 'mobx';
import DesignStep from './designStep';
import DocumentStep from './documentStep';

export default observer(function CreateUpdateRegistration() {
  const { documentLibraryStore } = useStore();
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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState('Design');
  const [registeredUsersIndicator, setRegisteredUsersIndicator] =
    useState(false);
  const handeSetActiveStepToDesign = () => {
    setActiveStep('Design');
  };

  const handleSetActiveStepToDocument = () => {
    setActiveStep('Document');
    setLoadTreeData(true);
  };

  const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
    new RegistrationEventFormValues(),
  );
  const [registrationEventId, setRegistrationEventId] = useState(uuidv4());
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [registrationEventOwners, setRegistrationEventOwners] = useState<
    RegistrationEventOwner[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadTreeData, setLoadTreeData] = useState(false);
  const [userEmails, setUserEmails] = useState<string[]>([]);

  const handleSetRegistrationEvent = (event: RegistrationEvent) => {
    setRegistrationEvent(event);
  };

  const handleSetRegistrationEventOwners = (
    newRegistrationEventOwners: RegistrationEventOwner[],
  ) => {
    setRegistrationEventOwners(newRegistrationEventOwners);
  };

  const handleSetContent = (newContent: string) => {
    setContent(newContent);
  };

  const handleSetDocumentLibraryContent = (newContent: string) => {
    setDocumentLibraryContent(newContent);
  };

  const handleSetCustomQuestions = (newCustomQuestions: CustomQuestion[]) => {
    setCustomQuestions(newCustomQuestions);
  };

  const handleDesignClick = () => {
    setActiveStep('Design');
  };

  useEffect(() => {
    if (loadTreeData) {
      documentLibraryStore.fetchAndStoreTreeData(registrationEventId);
    }
  }, [loadTreeData, registrationEventId, documentLibraryStore]);

  useEffect(() => {
    if (userEmails.length < 1) {
      agent.Account.listEmails().then((response) => {
        setUserEmails(response);
      });
    }
  }, [userEmails]);

  useEffect(() => {
    const disposer = reaction(
      () => documentLibraryStore.TreeDataRegistry.get(registrationEventId),
      (data) => {
        if (data) {
          setTreeData(data);
        }
      },
    );

    return () => disposer();
  }, [registrationEventId, documentLibraryStore]);

  useEffect(() => {
    if (id) getRegistrationEvent();
  }, [id]);

  useEffect(() => {
    if (step) setActiveStep(step);
  }, [step]);

  const getRegistrationEvent = async () => {
    setLoading(true);
    try {
      const registrationEvent: RegistrationEvent =
        await agent.RegistrationEvents.details(id!);
      setRegistrationEvent(registrationEvent);
      setRegistrationEventId(registrationEvent.id);

      const registrationEventWebsite: RegistrationEventWebsite | null =
        await agent.RegistrationEventWebsites.details(id!);
      if (registrationEventWebsite)
        setContent(registrationEventWebsite.content);
      const customQuestionData: CustomQuestion[] =
        await agent.CustomQuestions.details(id!);

      const documentUploadWebsite: RegistrationEventWebsite | null =
        await agent.DocumentUploadWebsites.details(id!);
      if (documentUploadWebsite)
        setDocumentLibraryContent(documentUploadWebsite.content);

      if (customQuestionData && customQuestionData.length)
        setCustomQuestions(customQuestionData);
      const registrationEventOwnersData: RegistrationEventOwner[] =
        await agent.RegistrationEventOwners.list(id!);
      if (registrationEventOwnersData && registrationEventOwnersData.length)
        setRegistrationEventOwners(registrationEventOwnersData);
      const registrations: Registration[] = await agent.Registrations.list(
        registrationEvent.id,
      );
      if (registrations && registrations.length)
        setRegisteredUsersIndicator(true);
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('An error occured loading data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentLibraryClick = async () => {
    if (formisDirty) {
      setSavingFromStepClick(true);
      setRegistrationEvent((prevState) => ({
        ...prevState,
        id: registrationEventId,
      }));

      const data = { ...registrationEvent, id: registrationEventId };

      try {
        await agent.RegistrationEvents.createUpdate(data);
        await agent.RegistrationEventWebsites.createUpdate({
          registrationEventId,
          content,
        });
        await agent.CustomQuestions.createUpdate(
          registrationEventId,
          customQuestions,
        );
        setFormisDirty(false);
        if (!id) {
          navigate(`/editregistration/${registrationEventId}/Review`);
        } else {
          handleSetActiveStepToDocument();
        }
      } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error('An error occurred: ' + error.message);
        } else {
          toast.error('Save failed!');
        }
      } finally {
        setSavingFromStepClick(false);
      }
    } else {
      handleSetActiveStepToDocument();
    }
  };

  const handleReviewClick = async () => {
    if (formisDirty) {
      setSavingFromStepClick(true);
      setRegistrationEvent((prevState) => ({
        ...prevState,
        id: registrationEventId,
      }));

      const data = { ...registrationEvent, id: registrationEventId };

      try {
        await agent.RegistrationEvents.createUpdate(data);
        await agent.RegistrationEventWebsites.createUpdate({
          registrationEventId,
          content,
        });
        await agent.DocumentUploadWebsites.createUpdate({
          registrationEventId,
          content: documentLibraryContent,
        });
        await agent.CustomQuestions.createUpdate(
          registrationEventId,
          customQuestions,
        );
        setFormisDirty(false);
        if (!id) {
          navigate(`/editregistration/${registrationEventId}/Review`);
        } else {
          setActiveStep('Review');
        }
      } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error('An error occurred: ' + error.message);
        } else {
          toast.error('Save failed!');
        }
      } finally {
        setSavingFromStepClick(false);
      }
    } else {
      setActiveStep('Review');
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await agent.RegistrationEvents.publish(registrationEventId);
      setRegistrationEvent((prevState) => ({
        ...prevState,
        published: true,
      }));
      toast.success('Publish was successful!');
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('Published failed!');
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      await agent.RegistrationEvents.unpublish(registrationEventId);
      setRegistrationEvent((prevState) => ({
        ...prevState,
        published: false,
      }));
      toast.success('Un Publish was successful!');
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('Un Published failed!');
      }
    } finally {
      setPublishing(false);
    }
  };

  const saveFormInBackground = async () => {
    if (id) {
      let error = false;
      if (!registrationEvent.title || !registrationEvent.title.trim())
        error = true;
      if (!registrationEvent.location || !registrationEvent.location.trim())
        error = true;
      if (!registrationEvent.startDate || !registrationEvent.startDate)
        error = true;
      if (!registrationEvent.certified) error = true;
      if (!error) {
        setRegistrationEvent((prevState) => ({
          ...prevState,
          id: registrationEventId,
        }));

        const data = { ...registrationEvent, id: registrationEventId };

        try {
          await agent.RegistrationEvents.createUpdate(data);
          await agent.RegistrationEventWebsites.createUpdate({
            registrationEventId,
            content,
          });
          await agent.DocumentUploadWebsites.createUpdate({
            registrationEventId,
            content: documentLibraryContent,
          });
          await agent.DocumentUploadWebsites.createUpdate({
            registrationEventId,
            content: documentLibraryContent,
          });
          await agent.CustomQuestions.createUpdate(
            registrationEventId,
            customQuestions,
          );
          await agent.RegistrationEventOwners.createUpdate(
            registrationEventId,
            registrationEventOwners,
          );
          setFormisDirty(false);
        } catch (e: any) {
          console.log(e);
          if (error && e.message) {
            toast.error('An error occurred: ' + e.message);
          } else {
            toast.error('Save failed!');
          }
        }
      }
    }
  };

  const saveForm = async () => {
    setFormSubmitted(true);
    let error = false;
    if (!registrationEvent.title || !registrationEvent.title.trim())
      error = true;
    if (!registrationEvent.location || !registrationEvent.location.trim())
      error = true;
    if (!registrationEvent.startDate || !registrationEvent.startDate)
      error = true;
    if (!registrationEvent.certified) error = true;
    if (error) window.scrollTo(0, 0);
    if (!error) {
      setSaving(true);
      setRegistrationEvent((prevState) => ({
        ...prevState,
        id: registrationEventId,
      }));

      const data = { ...registrationEvent, id: registrationEventId };

      try {
        await agent.RegistrationEvents.createUpdate(data);
        await agent.RegistrationEventWebsites.createUpdate({
          registrationEventId,
          content,
        });
        await agent.DocumentUploadWebsites.createUpdate({
          registrationEventId,
          content: documentLibraryContent,
        });
        await agent.CustomQuestions.createUpdate(
          registrationEventId,
          customQuestions,
        );
        await agent.RegistrationEventOwners.createUpdate(
          registrationEventId,
          registrationEventOwners,
        );
        toast.success('Save was successful!');
        setFormisDirty(false);
        if (!id) navigate(`/editregistration/${registrationEventId}`);
      } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error('An error occurred: ' + error.message);
        } else {
          toast.error('Save failed!');
        }
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <LoadingComponent content="Loading Data..." />;
  return (
    <>
      <ManageRegistrationNavbar />

      <StepGroup fluid size="huge">
        <Step active={activeStep === 'Design'} onClick={handleDesignClick}>
          <Icon name="paint brush" />
          <StepContent>
            <StepTitle>Design</StepTitle>
            <StepDescription>Design Your Registration Form</StepDescription>
          </StepContent>
        </Step>

        <Step
          onClick={handleReviewClick}
          active={activeStep === 'Review'}
          disabled={
            savingFromStepClick ||
            !registrationEvent.title ||
            !registrationEvent.title.trim() ||
            !registrationEvent.location ||
            !registrationEvent.location.trim() ||
            !registrationEvent.startDate ||
            !registrationEvent.endDate ||
            !registrationEvent.certified
          }
        >
          {savingFromStepClick && <Loader active inline />}
          {!savingFromStepClick && <Icon name="check" />}
          <StepContent>
            <StepTitle>Review and Publish</StepTitle>
            <StepDescription>Review Your Site and Publish</StepDescription>
          </StepContent>
        </Step>
        {registrationEvent.documentLibrary && (
          <Step
            onClick={handleDocumentLibraryClick}
            active={activeStep === 'Document'}
            disabled={
              savingFromStepClick ||
              !registrationEvent.title ||
              !registrationEvent.title.trim() ||
              !registrationEvent.location ||
              !registrationEvent.location.trim() ||
              !registrationEvent.startDate ||
              !registrationEvent.endDate ||
              !registrationEvent.certified
            }
          >
            {savingFromStepClick && <Loader active inline />}
            {!savingFromStepClick && <Icon name="folder open" />}
            <StepContent>
              <StepTitle>Document Library</StepTitle>
              <StepDescription>
                Create a document library for your registrants
              </StepDescription>
            </StepContent>
          </Step>
        )}
      </StepGroup>

      {activeStep === 'Design' && (
        <DesignStep
          registrationEvent={registrationEvent}
          setRegistrationEvent={handleSetRegistrationEvent}
          formSubmitted={formSubmitted}
          setFormDirty={handleSetFormDirty}
          content={content}
          setContent={handleSetContent}
          registrationEventOwners={registrationEventOwners}
          setRegistrationEventOwners={handleSetRegistrationEventOwners}
          registrationEventId={registrationEventId}
          saveFormInBackground={saveFormInBackground}
          userEmails={userEmails}
          formisDirty={formisDirty}
          savingFromStepClick={savingFromStepClick}
          saving={saving}
          saveForm={saveForm}
          registeredUsersIndicator={registeredUsersIndicator}
          customQuestions={customQuestions}
          setCustomQuestions={handleSetCustomQuestions}
          handleReviewClick={handleReviewClick}
        />
      )}

      {activeStep === 'Review' && (
        <ReviewAndPublishRegistration
          registrationEvent={registrationEvent}
          content={content}
          customQuestions={customQuestions}
          publish={handlePublish}
          unPublish={handleUnpublish}
          publishing={publishing}
          setActiveStep={handeSetActiveStepToDesign}
          registrationEventId={registrationEventId}
        />
      )}

      {activeStep === 'Document' && (
        <DocumentStep
          documentLibraryContent={documentLibraryContent}
          formisDirty={formisDirty}
          setContent={handleSetDocumentLibraryContent}
          setFormDirty={handleSetFormDirty}
          savingFromStepClick={savingFromStepClick}
          registrationEventId={registrationEventId}
          treeData={treeData}
          saving={saving}
          saveForm={saveForm}
        />
      )}
    </>
  );
});
