import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import ArmyLogo from "../home/ArmyLogo";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { QuestionType } from "../../app/models/questionType";
import { useStore } from '../../app/stores/store';
import { Button, ButtonContent, ButtonGroup, Divider, DropdownProps, Form, FormField, Grid, Header, Icon, Input, Loader, Menu, Message, Select } from "semantic-ui-react";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { RegistrationLink } from "../../app/models/registrationLink";
import { RegistrationEventWebsite } from "../../app/models/registrationEventWebsite";
import { CustomQuestion } from "../../app/models/customQuestion";
import { Registration } from "../../app/models/registration";
import { registrationDTO } from "../../app/models/registrationDTO";
import { stateToHTML } from "draft-js-export-html";
import { useNavigate } from "react-router-dom";
import { AnswerAttachment } from "../../app/models/answerAttachment";
import { v4 as uuid } from "uuid";
import DocumentUploadWidget from "../documentUpload/documentUploadWidget";

const apiUrl = import.meta.env.VITE_API_URL;

const query = new URLSearchParams(location.search);
function formatDate(date : Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  export default observer(function RegisterFromLink() {

    const { responsiveStore, attachmentStore } = useStore();
    const {isMobile} = responsiveStore
    const {uploadAnswerDocument, uploading}  = attachmentStore
    const navigate = useNavigate();
    const [formisDirty, setFormisDirty] = useState(false);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const encryptedKey = query.get('key');
    const [validating, setValidating] = useState(true);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: '',
          published: true,
          public: true,
          autoApprove: true,
          certified: true
        }  
    );
    const [registration, setRegistration] = useState<Registration>({
      id: uuid(),
      registrationEventId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      registrationDate: new Date(),
      registered: false
      }
    )
    const [answerAttachments, setAnswerAttachments] = useState<AnswerAttachment[]>([]);
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
    const [email, setEmail] = useState('');

    useEffect(() => {
        getData();
        }, [encryptedKey])

        useEffect(() => {
          if(content){
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(
                  JSON.parse(content)
                )
              )
            );
          }
        }, [content]);

        function displayDateRange(startDate : Date, endDate : Date) {
          const formattedStartDate = formatDate(startDate);
          const formattedEndDate = formatDate(endDate);
        
          // Check if start and end dates are the same
          if (formattedStartDate === formattedEndDate) {
            return formattedStartDate;
          } else {
            return `${formattedStartDate} - ${formattedEndDate}`;
          }
        }

    const getData = async() => {
        if (!encryptedKey) return;
        const decodedKey = decodeURIComponent(encryptedKey);
        try{
            setValidating(true);
            await agent.EmailLinks.validate(decodedKey);
            setValidating(false);
            setValidated(true);
            setLoading(true);
            const registrationEvent : RegistrationEvent = await agent.EmailLinks.getRegistrationEvent(decodedKey);
            setRegistrationEvent(registrationEvent)
            const registrationLink : RegistrationLink = await agent.EmailLinks.getRegistrationLink(decodedKey);
            setEmail(registrationLink.email);
            const registrationEventWebsite : RegistrationEventWebsite | null = await agent.RegistrationEventWebsites.details(registrationEvent.id);
            if(registrationEventWebsite && registrationEventWebsite) setContent(registrationEventWebsite.content);
            const customQuestionData : CustomQuestion[] = await agent.CustomQuestions.details(registrationEvent.id);
            if(customQuestionData && customQuestionData.length) setCustomQuestions(customQuestionData);
            const registrationData : Registration = await agent.EmailLinks.getRegistration(decodedKey);
            if(registrationData && registrationData.id && registrationData.email){
              setRegistration(registrationData);
              const answerAttachmentData : AnswerAttachment[] = await agent.EmailLinks.getAnswerAttachments(decodedKey);
              setAnswerAttachments(answerAttachmentData);
            }  

        
          } catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("invalid email link");
            }
          } finally {
            setValidating(false);
            setLoading(false);
          }
    }

    const findAnswerAttachmentByQuestionId = (questionId: string): AnswerAttachment | null => {
      return answerAttachments.find(x => x.customQuestionLookup === questionId) || null;
    };

    const handleSubmit = async () => {
      if(!saving){
      setFormisDirty(true);
      let formHasError =
       !registration.firstName || !registration.firstName.trim() ||
       !registration.lastName || !registration.lastName.trim() 

       const customQuestionsErrors = customQuestions.some(question => 
        question.required && question.questionType !== QuestionType.Attachment &&
        (!registration.answers?.find(x => x.customQuestionId === question.id)?.answerText ||
         !registration.answers?.find(x => x.customQuestionId === question.id)?.answerText.trim())
      );

      const findAnswerAttachmentByQuestionId = (questionId: string): AnswerAttachment | null => {
        return answerAttachments.find(x => x.customQuestionLookup === questionId) || null;
      };

      const attachmentErrors = customQuestions.some(question =>
        question.required && question.questionType === QuestionType.Attachment &&
        !findAnswerAttachmentByQuestionId(question.id) 
        );

      formHasError = formHasError || customQuestionsErrors || attachmentErrors;


       if(!formHasError){
         try{
           setSaving(true);
           const decodedKey = decodeURIComponent(encryptedKey!);
           const contentState = editorState.getCurrentContent();
           const hcontent = stateToHTML(contentState);
           const registrationDTO : registrationDTO = {decodedKey, hcontent, ...registration }
           await agent.EmailLinks.createUpdateRegistration(registrationDTO);
           navigate(`/thankyouforregisteringfromlink/${encodeURIComponent(encryptedKey!)}`);
          } catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("an error occured during save");
            }
          } finally {
            setSaving(false);
          }
       }
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setRegistration({ ...registration, [name]: value });
  };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const updatedRegistration = { ...registration };
      if (updatedRegistration.answers) {
        const answerIndex = updatedRegistration.answers.findIndex(answer => answer.customQuestionId === name);
        if (answerIndex !== -1) {
          updatedRegistration.answers[answerIndex] = { ...updatedRegistration.answers[answerIndex], answerText: value };
          setRegistration(updatedRegistration);
        }
      }
    }

    const handleCustomSelectChange = (e: React.SyntheticEvent<HTMLElement>, data: DropdownProps ) =>{
      const name = data.name as string;
      const value = data.value ?? '';
      const updatedRegistration = { ...registration };
      if (updatedRegistration.answers) {
        const answerIndex = updatedRegistration.answers.findIndex(answer => answer.customQuestionId === name);
        if (answerIndex !== -1) {
          updatedRegistration.answers[answerIndex] = { ...updatedRegistration.answers[answerIndex], answerText: value as string };
          setRegistration(updatedRegistration);
        }
      }
    }

    const handleDocumentUpload = async (file: any, customQuestionId : string) => {
      const answerAttachmentId = uuid();
      const fileName = file.name;
      const fileType = file.type;
      try{
      await uploadAnswerDocument(file, answerAttachmentId, customQuestionId, registration.id )
  
          const answerAttachment: AnswerAttachment = {
            id: answerAttachmentId,
            customQuestionLookup: customQuestionId,
            registrationLookup: registration.id,
            fileName: fileName,
            fileType: fileType
          };
  
          setAnswerAttachments([...answerAttachments, answerAttachment]);
        }
        catch(error :any) {
          console.log(error);
          toast.error(`Error uploading ${fileName}: ${error.message}`);
        }
      }

      const deleteAttachment = async (questionId: string) => {
        const answerAttachment = answerAttachments.find(x => x.customQuestionLookup === questionId);
        if(answerAttachment){
          try{
            setAnswerAttachments(answerAttachments.filter(x => x.id !== answerAttachment.id));
            const decodedKey = decodeURIComponent(encryptedKey!);
            agent.EmailLinks.deleteAnswerAttachment(decodedKey, answerAttachment.id);
          }  catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("an error occured during save");
            }
          } 
        }
      }

      const downloadAttachment = async (questionId: string) => {
        const answerAttachment = answerAttachments.find(x => x.customQuestionLookup === questionId);
        if (answerAttachment) {
          try {
            const decodedKey = decodeURIComponent(encryptedKey!);
            const body = JSON.stringify({
              id: answerAttachment!.id,
              encryptedKey: decodedKey
            });
            const requestOptions = {
              method: "POST",
              headers: { 'Content-Type': 'application/json' }, 
              body: body 
            };
            
            const attachmentData = await fetch(`${apiUrl}/upload/download`, requestOptions);
            
            if (!attachmentData.ok) {
              throw new Error('Network response was not ok.');
            }
      
            const data = await attachmentData.arrayBuffer();
            const file = new Blob([data], { type: answerAttachment.fileType });
            const fileUrl = window.URL.createObjectURL(file);
            const a = document.createElement("a");
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



    if (validating) return <LoadingComponent content="Validating Email Link..."/>
    if (loading) return <LoadingComponent content="Loading Data..."/>

    return(
        <>
        {!validated &&
           <Message negative
           icon='exclamation mark'
           header='Not Authorized'
           content='This is an invalid registration link.'
         />
        }
        {validated &&
        <>
          <Menu inverted color='black'  widths='2'>
              <Menu.Item>
                <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
            </Menu.Item>
            {!isMobile && 
            <Menu.Item>
              <Header as='h4' inverted>
                <Icon name='user' color='teal'/>
                  <Header.Content>
                    {email}
                  </Header.Content>
              </Header> 
            </Menu.Item>
           }
          </Menu>
           <Grid stackable style={{padding: '40px' }}>
              <Grid.Row>
              <Grid.Column width={8}>
              <Header as='h3'>
        <Icon name='pencil' />
         <Header.Content>
         {registrationEvent.title}
         </Header.Content>
        </Header> 
        <Header as='h3'>
        <Icon name='map marker alternate' />
         <Header.Content>
         {registrationEvent.location}
         </Header.Content>
        </Header> 
        <Header as='h3'>
        <Icon name='calendar' />
         <Header.Content>
         {displayDateRange(registrationEvent.startDate, registrationEvent.endDate)}
         </Header.Content>
        </Header> 
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
        <FormField required error={formisDirty && (!registration.firstName || !registration.firstName.trim()) } >
             <label>First Name</label>
            <Input value={registration.firstName}
            name="firstName"
            onChange={handleInputChange}/>
        </FormField>
        <FormField required error={formisDirty && (!registration.lastName || !registration.lastName.trim()) } >
             <label>Last Name</label>
            <Input value={registration.lastName}
            name="lastName"
            onChange={handleInputChange}/>
        </FormField>
        <FormField required >
             <label> Email</label>
            <Input value={registration.email}/>
       </FormField>
        {customQuestions.sort((a, b) => a.index - b.index).map((question) => (
          <FormField key={question.id} required={question.required}
          error={
            formisDirty &&
            question.required &&
            (
              (question.questionType !== QuestionType.Attachment &&
                (!registration.answers?.find(x => x.customQuestionId === question.id)?.answerText ||
                 !registration.answers?.find(x => x.customQuestionId === question.id)?.answerText.trim()
                )
              ) 
              ||
              (
                question.questionType === QuestionType.Attachment &&
                !findAnswerAttachmentByQuestionId(question.id) 
              )
           )
        }
          >
            <label>{question.questionText}</label>
            {question.questionType === QuestionType.Attachment && uploading &&
             <Loader active inline />
            }

             {question.questionType === QuestionType.Attachment &&  !findAnswerAttachmentByQuestionId(question.id) && !uploading &&
                   <>
                   <Divider color="black" />
                 
                       <DocumentUploadWidget
                        uploadDocument={handleDocumentUpload}
                        loading={uploading}
                        color={'black'}
                        questionId={question.id}
                        error={formisDirty && question.required && !findAnswerAttachmentByQuestionId(question.id)}
                        />

                   <Divider color="black" />
                 </>
              }

             {question.questionType === QuestionType.Attachment  && !uploading  && findAnswerAttachmentByQuestionId(question.id)?.fileName &&
              <ButtonGroup >
                <Button animated='vertical' basic color='blue' onClick={() => downloadAttachment(question.id)} type="button">
                <ButtonContent hidden>Download</ButtonContent>
                <ButtonContent visible>
                  <Icon name='paperclip' />{findAnswerAttachmentByQuestionId(question.id)?.fileName} 
                </ButtonContent>
              </Button>
              <Button animated='vertical' basic color='red' onClick={() => deleteAttachment(question.id)} type="button">
                <ButtonContent hidden>Delete</ButtonContent>
                <ButtonContent visible>
                  <Icon name='x' />
                </ButtonContent>
              </Button>
              </ButtonGroup>
              }

            {question.questionType === QuestionType.TextInput &&
             <Input value={registration.answers?.find(x => x.customQuestionId === question.id)?.answerText} 
              name={question.id}
              onChange={handleCustomInputChange }/>
             }
            {question.questionType === QuestionType.Choice &&
             <Select
             name={question.id}
             value={registration.answers?.find(x => x.customQuestionId === question.id)?.answerText || ''}
             search
             clearable
             placeholder='Select an option'
             onChange={(e, data) => handleCustomSelectChange(e, data)}
             options={ question.options
                ? question.options
                    .sort((a, b) => a.index - b.index)
                    .map(option => ({
                      key: option.id, 
                      value: option.optionText, 
                      text: option.optionText, 
                    }))
                : []}
           />
            }
          </FormField>
            ))}
            {registration.registered && 
            <Button type='button' size={isMobile ? 'tiny' : 'huge'} color='red' floated="right" content='Cancel Registration' onClick={() => navigate(`/deregisterforeventfromlink/${encodeURIComponent(encryptedKey!)}`)}  />
            }
            <Button type='submit' size={isMobile ? 'tiny' : 'huge'}  primary floated="right" content={registration.registered ? 'Update Registration': 'Register'} loading={saving} />
        </Form>
              </Grid.Column>
              </Grid.Row>
           </Grid>
           </>
        }
        </>
    )

  });