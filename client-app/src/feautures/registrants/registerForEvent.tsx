import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CustomQuestion } from '../../app/models/customQuestion';
import {
  RegistrationEvent,
  RegistrationEventFormValues,
} from '../../app/models/registrationEvent';
import { RegistrationEventWebsite } from '../../app/models/registrationEventWebsite';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import {
  Grid,
  Header,
  Icon,
  Menu,
  Form,
  Button,
  Dropdown,
} from 'semantic-ui-react';
import ArmyLogo from '../home/ArmyLogo';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { QuestionType } from '../../app/models/questionType';
import { useStore } from '../../app/stores/store';
import {
  Registration,
  RegistrationFormValues,
} from '../../app/models/registration';
import { stateToHTML } from 'draft-js-export-html';
import { RegistrationWithHTMLContent } from '../../app/models/registrationWithHTMLContent';
import { useNavigate } from 'react-router-dom';
import { AnswerAttachment } from '../../app/models/answerAttachment';
import { v4 as uuid } from 'uuid';
import CustomQuestionComponentForRegistrant from './customQuestionComponentForRegistrant';
import SignInMessage from './signInMessage';
import CommonFormQuestions from './commonFormQuestions';
import TitleLocationDate from './titleLocationDate';
import { OptionWithDisabled } from '../../app/models/optionsWithDisabled';
import { format } from 'date-fns';

const apiUrl = import.meta.env.VITE_API_URL;

export default observer(function RegisterForEvent() {
  const navigate = useNavigate();
  const { userStore, responsiveStore, commonStore } = useStore();
  const { token } = commonStore;
  const { isMobile } = responsiveStore;
  const { user, logout } = userStore;
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [numberOfApprovedRegistrants, setNumberOfApprovedRegistrants] =
    useState(0);
  const [extendedOptions, setExtendedOptions] = useState<OptionWithDisabled[]>(
    [],
  );
  const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
    new RegistrationEventFormValues(),
  );
  const [registration, setRegistration] = useState<Registration>(
    new RegistrationFormValues({ id: uuid() }),
  );
  const handleSetRegistration = (newRegistration: Registration) =>
    setRegistration(newRegistration);
  const [answerAttachments, setAnswerAttachments] = useState<
    AnswerAttachment[]
  >([]);
  const [formisDirty, setFormisDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const handleSetAnswerAttachments = (
    newAnswerAttachments: AnswerAttachment[],
  ) => setAnswerAttachments(newAnswerAttachments);

  useEffect(() => {
    const updateOptions = async () => {
      if (customQuestions && customQuestions.length > 0) {
        for (const customQuestion of customQuestions) {
          if (customQuestion.options && customQuestion.options.length > 0) {
            const newOptions: OptionWithDisabled[] = [];
            for (const opt of customQuestion.options) {
              let disabled = false;
              if (opt.optionQuota) {
                disabled = await fetchIsDisabled(opt.id);
              }
              const newOption: OptionWithDisabled = {
                id: opt.id,
                customQuestionId: opt.customQuestionId,
                optionText: opt.optionText,
                optionQuota: opt.optionQuota,
                index: opt.index,
                disabled,
              };
              newOptions.push(newOption);
            }
            setExtendedOptions((prevOptions) => [
              ...prevOptions,
              ...newOptions,
            ]);
          }
        }
      }
    };

    updateOptions();
  }, [customQuestions]);

  useEffect(() => {
    if (id) getRegistrationEvent();
  }, [id]);

  useEffect(() => {
    if (user && user.mail && registrationEvent && registrationEvent.id) {
      getRegistration();
    }
  }, [user, registrationEvent]);

  useEffect(() => {
    if (content) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(content))),
      );
    }
  }, [content]);

  const fetchIsDisabled = async (optionId: string) => {
    try {
      const response = await fetch(`${apiUrl}/OptionDisabled/${optionId}`);
      const isDisabled = await response.json();
      return isDisabled;
    } catch (error) {
      console.error('Error fetching disabled status:', error);
      return false;
    }
  };

  const getRegistration = async () => {
    setLoading2(true);
    try {
      const registrationData: Registration =
        await agent.Registrations.getRegistration(
          user!.mail,
          registrationEvent.id,
        );
      setRegistration(registrationData);
      if (registrationData && registrationData.id) {
        const answerAttachmentData: AnswerAttachment[] =
          await agent.AnswerAttachments.list(registrationData.id);
        setAnswerAttachments(answerAttachmentData);
      }
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('An error occured loading data');
      }
    } finally {
      setLoading2(false);
    }
  };

  const getRegistrationEvent = async () => {
    setLoading(true);
    try {
      const registrationEvent: RegistrationEvent =
        await agent.RegistrationEvents.details(id!);
      setRegistrationEvent(registrationEvent);
      if (
        registrationEvent &&
        registrationEvent.maxRegistrantInd &&
        registrationEvent.maxRegistrantNumber
      ) {
        const approvedRegistrants =
          await agent.Registrations.countRegisteredUsers(id!);
        setNumberOfApprovedRegistrants(approvedRegistrants);
      }
      const registrationEventWebsite: RegistrationEventWebsite | null =
        await agent.RegistrationEventWebsites.details(id!);
      if (registrationEventWebsite && registrationEventWebsite)
        setContent(registrationEventWebsite.content);
      const customQuestionData: CustomQuestion[] =
        await agent.CustomQuestions.details(id!);
      if (customQuestionData && customQuestionData.length)
        setCustomQuestions(customQuestionData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistration({ ...registration, [name]: value });
  };

  const handleSubmit = async () => {
    if (!saving) {
      setFormisDirty(true);
      let formHasError =
        !registration.firstName ||
        !registration.firstName.trim() ||
        !registration.lastName ||
        !registration.lastName.trim() ||
        !registration.email ||
        !registration.email.trim() ||
        !isValidEmail(registration.email);

      const customQuestionsErrors = customQuestions.some((question) => {
        const questionDiv = document.getElementById(question.id);
        if (!questionDiv) {
          return false;
        }

        return (
          question.required &&
          question.questionType !== QuestionType.Attachment &&
          (!registration.answers?.find(
            (x) => x.customQuestionId === question.id,
          )?.answerText ||
            !registration.answers
              ?.find((x) => x.customQuestionId === question.id)
              ?.answerText.trim())
        );
      });

      const attachmentErrors = customQuestions.some((question) => {
        const questionDiv = document.getElementById(question.id);
        if (!questionDiv) {
          return false;
        }
        return (
          question.required &&
          question.questionType === QuestionType.Attachment &&
          !findAnswerAttachmentByQuestionId(question.id)
        );
      });

      formHasError = formHasError || customQuestionsErrors || attachmentErrors;

      if (!formHasError) {
        try {
          setSaving(true);
          const contentState = editorState.getCurrentContent();
          const hcontent = stateToHTML(contentState);
          const registrationWithHTMLContent: RegistrationWithHTMLContent = {
            ...registration,
            hcontent,
          };
          await agent.Registrations.createUpdateRegistration(
            registrationWithHTMLContent,
          );
          navigate(`/thankyouforregistering/${id}`);
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error('An error occurred: ' + error.message);
          } else {
            toast.error('an error occured during save');
          }
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return emailRegex.test(email);
  };

  const getRegistrationIsClosedMessage  = () =>{
    let message="Registration is closed for this event";
    if(registrationEvent.registrationOpenDate){
    const today = new Date().toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    const registrationOpenDate = new Date(registrationEvent.registrationOpenDate).toISOString().split('T')[0];
    if (registrationOpenDate > today) { 
       message = `Registration for this event does not open until 
       ${ format( new Date(registrationEvent.registrationOpenDate),'MMM do',)}`
      }
    }
    return message;
  }

  const registrationIsOpen = () => {
    if (!registrationEvent.registrationIsOpen) return false;
    if (registrationEvent.registrationClosedDate) {
      const today = new Date().toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
      const registrationClosedDate = new Date(registrationEvent.registrationClosedDate).toISOString().split('T')[0];
      if (registrationClosedDate < today) { // Change to `<` to check if closed date is before today
          return false;
      }
  }
  if (registrationEvent.registrationOpenDate) {
      const today = new Date().toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
      const registrationOpenDate = new Date(registrationEvent.registrationOpenDate).toISOString().split('T')[0];
      if (registrationOpenDate > today) { // Change to `>` to check if open date is after today
          return false;
      }
  }
    if (
      registrationEvent.maxRegistrantInd &&
      registrationEvent.maxRegistrantNumber
    ) {
      const maxRegistrantNumberAsNumber = parseInt(
        registrationEvent.maxRegistrantNumber,
      );
      if (numberOfApprovedRegistrants >= maxRegistrantNumberAsNumber)
        return false;

    }
    return true;
  };

  const findAnswerAttachmentByQuestionId = (
    questionId: string,
  ): AnswerAttachment | null => {
    return (
      answerAttachments.find((x) => x.customQuestionLookup === questionId) ||
      null
    );
  };

  const deleteAttachment = async (questionId: string) => {
    const answerAttachment = answerAttachments.find(
      (x) => x.customQuestionLookup === questionId,
    );
    if (answerAttachment) {
      try {
        setAnswerAttachments(
          answerAttachments.filter((x) => x.id !== answerAttachment.id),
        );
        agent.AnswerAttachments.delete(answerAttachment.id);
      } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error('An error occurred: ' + error.message);
        } else {
          toast.error('an error occured during save');
        }
      }
    }
  };

  const downloadAttachment = async (questionId: string) => {
    const answerAttachment = answerAttachments.find(
      (x) => x.customQuestionLookup === questionId,
    );
    if (answerAttachment) {
      try {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);

        const requestOptions = {
          method: 'GET',
          headers: headers,
        };

        const attachmentData = await fetch(
          `${apiUrl}/upload/${answerAttachment.id}`,
          requestOptions,
        );

        if (!attachmentData.ok) {
          throw new Error('Network response was not ok.');
        }

        const data = await attachmentData.arrayBuffer();
        const file = new Blob([data], { type: answerAttachment.fileType });
        const fileUrl = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = answerAttachment.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || loading2)
    return <LoadingComponent content="Loading Data..." />;
  return (
    <>
      <Menu inverted color="black" widths="2">
        <Menu.Item>
          <ArmyLogo
            content={registrationEvent.title}
            size="2em"
            textColor="#FFF"
            outerStarColor="yellow"
            innerStarColor="black"
          />
        </Menu.Item>

        {user && !isMobile && (
          <Menu.Item>
            <Dropdown
              trigger={
                <>
                  <Icon name="user" />
                  {user?.displayName}
                </>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item icon="power" text="Logout" onClick={logout} />
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        )}
      </Menu>
      {!registrationIsOpen() && !registration.registered && (
        <Header
          as={'h1'}
          content={getRegistrationIsClosedMessage()}
          textAlign="center"
        />
      )}
      <Grid stackable style={{ padding: '40px' }}>
        <Grid.Row>
          <Grid.Column width={8}>
            <TitleLocationDate registrationEvent={registrationEvent} />
            <Editor
              editorState={editorState}
              readOnly={true}
              toolbarHidden={true}
              wrapperClassName="wrapper-class-preview"
              editorClassName="editor-class-preview"
              toolbarClassName="toolbar-class-hidden"
            />
          </Grid.Column>
          {user && (
            <Grid.Column width={8}>
              <Form onSubmit={handleSubmit}>
                <CommonFormQuestions
                  formisDirty={formisDirty}
                  registrationIsOpen={registrationIsOpen}
                  registration={registration}
                  handleInputChange={handleInputChange}
                  emailUpdateAllowed={true}
                />
                {customQuestions
                  .filter((x) => !x.parentQuestionOption)
                  .sort((a, b) => a.index - b.index)
                  .map((question) => (
                    <CustomQuestionComponentForRegistrant
                      key={question.id}
                      question={question}
                      customQuestions={customQuestions}
                      registration={registration}
                      registrationIsOpen={registrationIsOpen}
                      formisDirty={formisDirty}
                      findAnswerAttachmentByQuestionId={
                        findAnswerAttachmentByQuestionId
                      }
                      setAnswerAttachments={handleSetAnswerAttachments}
                      answerAttachments={answerAttachments}
                      downloadAttachment={downloadAttachment}
                      deleteAttachment={deleteAttachment}
                      setRegistration={handleSetRegistration}
                      extendedOptions={extendedOptions}
                    />
                  ))}
                {registration.registered && (
                  <Button
                    type="button"
                    size={isMobile ? 'tiny' : 'huge'}
                    color="red"
                    floated="right"
                    content="Cancel Registration"
                    onClick={() =>
                      navigate(`/deregisterforevent/${registration.id}`)
                    }
                  />
                )}
                <Button
                  type="submit"
                  size={isMobile ? 'tiny' : 'huge'}
                  primary
                  floated="right"
                  content={
                    registration.registered ? 'Update Registration' : 'Register'
                  }
                  loading={saving}
                  disabled={!registrationIsOpen() && !registration.registered}
                />
              </Form>
            </Grid.Column>
          )}
          {!user && (
            <Grid.Column width={8}>
              <SignInMessage
                registrationIsOpen={registrationIsOpen}
                isMobile={isMobile}
                title={registrationEvent.title}
                id={id}
                getRegistrationIsClosedMessage = {getRegistrationIsClosedMessage}
              />
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    </>
  );
});
