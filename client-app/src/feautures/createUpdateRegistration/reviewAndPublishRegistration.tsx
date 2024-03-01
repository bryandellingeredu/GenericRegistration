import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { RegistrationEvent } from '../../app/models/registrationEvent';
import { CustomQuestion } from '../../app/models/customQuestion';
import { Form, FormField, Grid, Header, Icon, Input, Menu, Select } from 'semantic-ui-react';
import ArmyLogo from '../home/ArmyLogo';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { QuestionType } from '../../app/models/questionType';

interface Props{
   registrationEvent: RegistrationEvent
   content: string
   customQuestions: CustomQuestion[]
}

function formatDate(date : Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

export default observer(function ReviewAndPublishRegistration(
    {registrationEvent, content, customQuestions} : Props
) {

    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

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
      }, []);

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

    return (
        <>
        <Menu inverted color='black' widths={3}>
        <Menu.Item >
        <Header as='h4' inverted>
        <Icon name='map marker alternate' color='teal' />
         <Header.Content>
         {registrationEvent.location}
         </Header.Content>
        </Header> 
        </Menu.Item>
        <Menu.Item>
        <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
        </Menu.Item>
        <Menu.Item>
        <Header as='h3' inverted>
        <Icon name='calendar' color='teal'/>
         <Header.Content>
         {displayDateRange(registrationEvent.startDate, registrationEvent.endDate)}
         </Header.Content>
        </Header> 
        </Menu.Item>
      </Menu>

      <Grid  stackable style={{padding: '40px' }}>
      <Grid.Row>
      <Grid.Column width={8}>
      <Editor
            editorState={editorState}
            readOnly={true}
            toolbarHidden={true}
            wrapperClassName="wrapper-class-preview"
            editorClassName="editor-class-preview"
            toolbarClassName="toolbar-class-hidden"
        />
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
       
        </Grid.Column>
        <Grid.Column width={8}>
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
        </Form>
        </Grid.Column>
      </Grid.Row>
      </Grid>
        </>
    )
})

