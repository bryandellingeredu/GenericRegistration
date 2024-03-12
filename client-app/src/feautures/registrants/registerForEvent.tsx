import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { CustomQuestion } from "../../app/models/customQuestion";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { RegistrationEventWebsite } from "../../app/models/registrationEventWebsite";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { FormField, Grid, Header, Icon, Input, Menu, Form, Select, Button, Message, Divider, MessageList, MessageItem } from "semantic-ui-react";
import ArmyLogo from "../home/ArmyLogo";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { QuestionType } from "../../app/models/questionType";
import { useStore } from '../../app/stores/store';

function formatDate(date : Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default observer(function RegisterForEvents() {
  const { userStore, responsiveStore } = useStore();
  const {isMobile} = responsiveStore
  const { user } = userStore;
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
        }  
    );
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
    const [loading, setLoading] = useState(true);
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

    if (loading) return <LoadingComponent content="Loading Data..."/>
    return (
      <>
      <Menu inverted color='black'  widths='2'>
      <Menu.Item>
      <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
      </Menu.Item>
      
      {user &&
         <Menu.Item>
      <Header as='h4' inverted>
      <Icon name='user' color='teal'/>
       <Header.Content>
       {user.displayName}
       </Header.Content>
      </Header> 
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
          <Form>
        <FormField required >
             <label>First Name</label>
            <Input value={''}/>
        </FormField>
        <FormField required >
             <label>Last Name</label>
            <Input value={''}/>
        </FormField>
        <FormField required >
             <label> Email</label>
            <Input value={''}/>
       </FormField>
       <FormField required >
             <label>Phone</label>
            <Input placeholder='(###) ### - ####' value={''}/>
        </FormField>
        {customQuestions.sort((a, b) => a.index - b.index).map((question) => (
          <FormField key={question.id} required={question.required}>
            <label>{question.questionText}</label>
            {question.questionType === QuestionType.TextInput && <Input value={''}/>}
            {question.questionType === QuestionType.Choice &&
             <Select
             search
             clearable
             placeholder='Select an option'
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
            <Button type='submit' size='huge' primary floated="right" content='Register' />
        </Form>
        </Grid.Column> }
        {!user && <Grid.Column width={8}>
            <Message info>
              <Message.Header>
              <Divider horizontal>
      <Header as='h4'>
        <Icon name='tag' />
        Register For {registrationEvent.title}
      </Header>
    </Divider>
              </Message.Header>
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