import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import ArmyLogo from '../home/ArmyLogo';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { QuestionType } from '../../app/models/questionType';
import { useStore } from '../../app/stores/store';
import {
  Button,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Menu,
  Message,
} from 'semantic-ui-react';
import {
  RegistrationEvent,
  RegistrationEventFormValues,
} from '../../app/models/registrationEvent';
import { RegistrationLink } from '../../app/models/registrationLink';
import { RegistrationEventWebsite } from '../../app/models/registrationEventWebsite';
import { CustomQuestion } from '../../app/models/customQuestion';
import {
  Registration,
  RegistrationFormValues,
} from '../../app/models/registration';
import { registrationDTO } from '../../app/models/registrationDTO';
import { stateToHTML } from 'draft-js-export-html';
import { useNavigate } from 'react-router-dom';
import { AnswerAttachment } from '../../app/models/answerAttachment';
import { v4 as uuid } from 'uuid';
import CustomQuestionComponentForRegistrant from './customQuestionComponentForRegistrant';
import CommonFormQuestions from './commonFormQuestions';
import TitleLocationDate from './titleLocationDate';
import { OptionWithDisabled } from '../../app/models/optionsWithDisabled';

const apiUrl = import.meta.env.VITE_API_URL;

const query = new URLSearchParams(location.search);

export default observer(function RegisterFromLink() {
  const { responsiveStore } = useStore();
  const { isMobile } = responsiveStore;
  const navigate = useNavigate();
  const [formisDirty, setFormisDirty] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const encryptedKey = query.get('key');
  const [validating, setValidating] = useState(true);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [extendedOptions, setExtendedOptions] = useState<OptionWithDisabled[]>(
    [],
  );
  const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
    new RegistrationEventFormValues(),
  );
  const [registration, setRegistration] = useState<Registration>(
    new RegistrationFormValues({ id: uuid() }),
  );
  const [answerAttachments, setAnswerAttachments] = useState<
    AnswerAttachment[]
  >([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [email, setEmail] = useState('');
  const [numberOfApprovedRegistrants, setNumberOfApprovedRegistrants] =
    useState(0);

  const handleSetAnswerAttachments = (
    newAnswerAttachments: AnswerAttachment[],
  ) => setAnswerAttachments(newAnswerAttachments);
  const handleSetRegistration = (newRegistration: Registration) =>
    setRegistration(newRegistration);

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

  useEffect(() => {
    getData();
  }, [encryptedKey]);

  useEffect(() => {
    if (content) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(content))),
      );
    }
  }, [content]);

  const getData = async () => {
    if (!encryptedKey) return;
    const decodedKey = decodeURIComponent(encryptedKey);
    try {
      setValidating(true);
      await agent.EmailLinks.validate(decodedKey);
      setValidating(false);
      setValidated(true);
      setLoading(true);
      const registrationEvent: RegistrationEvent =
        await agent.EmailLinks.getRegistrationEvent(decodedKey);
      setRegistrationEvent(registrationEvent);
      if (
        registrationEvent &&
        registrationEvent.maxRegistrantInd &&
        registrationEvent.maxRegistrantNumber
      ) {
        const registrations = await agent.EmailLinks.getRegistrationList(
          decodedKey,
          registrationEvent.id,
        );
        if (registrations && registrations.length > 0) {
          const approvedRegistrations = registrations.filter(
            (x) => x.registered,
          );
          if (approvedRegistrations.length > 0)
            setNumberOfApprovedRegistrants(approvedRegistrations.length);
        }
      }
      const registrationLink: RegistrationLink =
        await agent.EmailLinks.getRegistrationLink(decodedKey);
      setEmail(registrationLink.email);
      const registrationEventWebsite: RegistrationEventWebsite | null =
        await agent.RegistrationEventWebsites.details(registrationEvent.id);
      if (registrationEventWebsite && registrationEventWebsite)
        setContent(registrationEventWebsite.content);
      const customQuestionData: CustomQuestion[] =
        await agent.CustomQuestions.details(registrationEvent.id);
      if (customQuestionData && customQuestionData.length)
        setCustomQuestions(customQuestionData);
      const registrationData: Registration =
        await agent.EmailLinks.getRegistration(decodedKey);
      if (registrationData && registrationData.id && registrationData.email) {
        setRegistration(registrationData);
        const answerAttachmentData: AnswerAttachment[] =
          await agent.EmailLinks.getAnswerAttachments(decodedKey);
        setAnswerAttachments(answerAttachmentData);
      }
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('invalid email link');
      }
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const findAnswerAttachmentByQuestionId = (
    questionId: string,
  ): AnswerAttachment | null => {
    return (
      answerAttachments.find((x) => x.customQuestionLookup === questionId) ||
      null
    );
  };

  const handleSubmit = async () => {
    if (!saving) {
      setFormisDirty(true);
      let formHasError =
        !registration.firstName ||
        !registration.firstName.trim() ||
        !registration.lastName ||
        !registration.lastName.trim();

      const customQuestionsErrors = customQuestions.some((question) => {
        const questionDiv = document.getElementById(question.id);
        if (!questionDiv) {
          return false; // Skip the question if its corresponding div is not present
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

      const findAnswerAttachmentByQuestionId = (
        questionId: string,
      ): AnswerAttachment | null => {
        return (
          answerAttachments.find(
            (x) => x.customQuestionLookup === questionId,
          ) || null
        );
      };

      const attachmentErrors = customQuestions.some((question) => {
        const questionDiv = document.getElementById(question.id);
        if (!questionDiv) {
          return false; // Skip the question if its corresponding div is not present
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
          const decodedKey = decodeURIComponent(encryptedKey!);
          const contentState = editorState.getCurrentContent();
          const hcontent = stateToHTML(contentState);
          const registrationDTO: registrationDTO = {
            decodedKey,
            hcontent,
            ...registration,
          };
          await agent.EmailLinks.createUpdateRegistration(registrationDTO);
          navigate(
            `/thankyouforregisteringfromlink/${encodeURIComponent(encryptedKey!)}`,
          );
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistration({ ...registration, [name]: value });
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
        const decodedKey = decodeURIComponent(encryptedKey!);
        agent.EmailLinks.deleteAnswerAttachment(
          decodedKey,
          answerAttachment.id,
        );
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
        const decodedKey = decodeURIComponent(encryptedKey!);
        const body = JSON.stringify({
          id: answerAttachment!.id,
          encryptedKey: decodedKey,
        });
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
        };

        const attachmentData = await fetch(
          `${apiUrl}/upload/download`,
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

  const registrationIsOpen = () => {
    if (!registrationEvent.registrationIsOpen) return false;
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

  if (validating)
    return <LoadingComponent content="Validating Email Link..." />;
  if (loading) return <LoadingComponent content="Loading Data..." />;

  return (
    <>
      {!validated && (
        <Message
          negative
          icon="exclamation mark"
          header="Not Authorized"
          content="This is an invalid registration link."
        />
      )}
      {validated && (
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
            {!isMobile && (
              <Menu.Item>
                <Header as="h4" inverted>
                  <Icon name="user" color="teal" />
                  <Header.Content>{email}</Header.Content>
                </Header>
              </Menu.Item>
            )}
          </Menu>
          {!registrationIsOpen() && !registration.registered && (
            <Header
              as={'h1'}
              content="Registration is Closed For This Event"
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
              <Grid.Column width={8}>
                <Form onSubmit={handleSubmit}>
                  <CommonFormQuestions
                    formisDirty={formisDirty}
                    registrationIsOpen={registrationIsOpen}
                    registration={registration}
                    handleInputChange={handleInputChange}
                    emailUpdateAllowed={false}
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
                        navigate(
                          `/deregisterforeventfromlink/${encodeURIComponent(encryptedKey!)}`,
                        )
                      }
                    />
                  )}
                  <Button
                    type="submit"
                    size={isMobile ? 'tiny' : 'huge'}
                    primary
                    floated="right"
                    content={
                      registration.registered
                        ? 'Update Registration'
                        : 'Register'
                    }
                    loading={saving}
                    disabled={!registrationIsOpen() && !registration.registered}
                  />
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </>
      )}
    </>
  );
});
