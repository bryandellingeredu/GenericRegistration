import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { CustomQuestion } from "../../app/models/customQuestion";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { RegistrationEventWebsite } from "../../app/models/registrationEventWebsite";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { FormField, Grid, Header, Icon, Input, Menu, Form, Select, Button, Message, Divider, MessageList, MessageItem, Dropdown, DropdownProps } from "semantic-ui-react";
import ArmyLogo from "../home/ArmyLogo";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { QuestionType } from "../../app/models/questionType";
import { useStore } from '../../app/stores/store';
import { Registration } from "../../app/models/registration";
import { convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { RegistrationWithHTMLContent } from "../../app/models/registrationWithHTMLContent";
import { useNavigate } from "react-router-dom";



function formatDate(date : Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default observer(function RegisterForEvent() {
  const navigate = useNavigate();
  const { userStore, responsiveStore } = useStore();
  const {isMobile} = responsiveStore
  const { user, logout } = userStore;
    const { id } = useParams();
    const [content, setContent] = useState('');
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
      id: '',
      registrationEventId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      registrationDate: new Date(),
      registered: false,
      }
    )
    const [formisDirty, setFormisDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(false);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

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

    useEffect(() => {
        if(id) getRegistrationEvent();     
      }, [id]);

      useEffect(() => {
        if(user && user.mail && registrationEvent && registrationEvent.id)
        {
          getRegistration();
        } 
      }, [user, registrationEvent]);

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

      const getRegistration = async () => {
        setLoading2(true)
        try{
          const registrationData : Registration = await agent.Registrations.getRegistration(user!.mail, registrationEvent.id);
          setRegistration(registrationData);
         }catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("An error occured loading data");
          }
        }finally {
          setLoading2(false);
          }
      }

      const getRegistrationEvent = async () => {
        setLoading(true);
        try{
            const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
            setRegistrationEvent(registrationEvent);
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

    const handleSignIn = () =>{
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const url = `${baseUrl}?redirecttopage=registerforevent/${id}`
      window.location.href = url;
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

  const handleSubmit = async () => {
    if(!saving){
    setFormisDirty(true);
    let formHasError =
     !registration.firstName || !registration.firstName.trim() ||
     !registration.lastName || !registration.lastName.trim() ||
     !registration.email || !registration.email.trim() || !isValidEmail(registration.email);

     const customQuestionsErrors = customQuestions.some(question => 
      question.required &&
      (!registration.answers?.find(x => x.customQuestionId === question.id)?.answerText ||
       !registration.answers?.find(x => x.customQuestionId === question.id)?.answerText.trim())
    );

    formHasError = formHasError || customQuestionsErrors;


     if(!formHasError){
       try{
         setSaving(true);
         const contentState = editorState.getCurrentContent();
        const hcontent = stateToHTML(contentState);
        const registrationWithHTMLContent : RegistrationWithHTMLContent = {...registration, hcontent}
         await agent.Registrations.createUpdateRegistration(registrationWithHTMLContent);
         navigate(`/thankyouforregistering/${id}`);
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

  const isValidEmail = (email : string) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return emailRegex.test(email);
  };
  

    if (loading || loading2) return <LoadingComponent content="Loading Data..."/>
    return (
      <>
      <Menu inverted color='black'  widths='2'>
      <Menu.Item>
      <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
      </Menu.Item>
      
      {user && !isMobile &&
         <Menu.Item>
      <Dropdown trigger={
      <>
        <Icon name="user" />
         {user?.displayName}
         </>
      }>
                <Dropdown.Menu>
                  <Dropdown.Item icon="power" text="Logout" onClick={logout} />
                </Dropdown.Menu>
              </Dropdown>
      </Menu.Item>
      }

    </Menu>
    <Grid  stackable style={{padding: '40px' }}>
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
       {user && <Grid.Column width={8}>
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
        <FormField required error={formisDirty && (!registration.email || !registration.email.trim() || !isValidEmail(registration.email) ) } >
             <label>Email</label>
            <Input value={registration.email}
            name="email"
            onChange={handleInputChange}/>
        </FormField>
        {customQuestions.sort((a, b) => a.index - b.index).map((question) => (
          <FormField key={question.id} required={question.required}
          error={formisDirty && question.required &&
            (!registration.answers?.find(x => x.customQuestionId === question.id)?.answerText ||
             !registration.answers?.find(x => x.customQuestionId === question.id)?.answerText.trim()) 
            }
            >
            <label>{question.questionText}</label>
            {question.questionType === QuestionType.TextInput &&
               <Input value={registration.answers?.find(x => x.customQuestionId === question.id)?.answerText} 
                name={question.id}
                onChange={handleCustomInputChange }/>}
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
            <Button type='button' size='huge' color='red' floated="right" content='Cancel Registration' onClick={() => navigate(`/deregisterforevent/${registration.id}`)}  />
            }
            <Button type='submit' size='huge' primary floated="right" content={registration.registered ? 'Update Registration': 'Register'} loading={saving} />
        </Form>
        </Grid.Column> }
        {!user && <Grid.Column width={8}>
            <Message info>
              {!isMobile && 
              <Message.Header>
              <Divider horizontal>
      <Header as='h4'>
        <Icon name='tag' />
        Register For {registrationEvent.title}
      </Header>
    </Divider>
              </Message.Header>}
              <Message.Content>
                <h4>
                In order to register for this event you will need to sign in 
                </h4>
              </Message.Content>
              <MessageList>
                <MessageItem>You can sign in with an Edu Account</MessageItem>
                <MessageItem>You can sign in with a CAC</MessageItem>
                <MessageItem>You can sign in by having a confirmation link emailed to you</MessageItem>
            </MessageList>
            <Message.Content>
              <Button size="huge" primary content='Sign In' style={{marginTop: '40px'}} onClick={handleSignIn}/>
            </Message.Content>
            </Message>
        </Grid.Column>}
      </Grid.Row>
    </Grid>
    </>
           );
});