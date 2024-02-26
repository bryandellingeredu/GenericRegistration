import { observer } from "mobx-react-lite";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Editor } from "react-draft-wysiwyg";
import { Divider, FormField, FormGroup, Header, HeaderContent, Icon, Input, Menu, Form } from "semantic-ui-react";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import ArmyLogo from "../home/ArmyLogo";
import { EditorState } from "draft-js";
import { CustomQuestion } from "../../app/models/customQuestion";
import PagePreviewCustomQuestion from "./pagePreviewCustomQuestion";


interface Props{
    registrationEvent: RegistrationEvent
    editorState: EditorState
    customQuestions: CustomQuestion[]
}

function formatDate(date : Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

export default observer (function RegistrationPagePreview({registrationEvent, editorState, customQuestions} : Props) {

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

      const chunkQuestions = (questions: CustomQuestion[], size: number): CustomQuestion[][] =>
      questions.reduce<CustomQuestion[][]>((chunks, item, index) => {
        const chunkIndex = Math.floor(index / size);
        if (!chunks[chunkIndex]) {
          chunks[chunkIndex] = []; // start a new chunk
        }
        chunks[chunkIndex].push(item);
        return chunks;
      }, []);

      
    return(
        <>
        <Menu inverted color='black' widths={3}>
        <Menu.Item>
      
        </Menu.Item>
        <Menu.Item>
        <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
        </Menu.Item>
        <Menu.Item>
          {/* Placeholder for right-aligned items if needed */}
        </Menu.Item>
      </Menu>
      <div style={{ padding : '40px' }}>

            <Header as='h2' floated='right'>
            <Icon name='calendar' />
            <HeaderContent>  {displayDateRange(registrationEvent.startDate, registrationEvent.endDate)}</HeaderContent>
        </Header>
        <Header as='h2' floated='left'>
        <Icon name='map marker' />
            <HeaderContent>{registrationEvent.location}</HeaderContent>
        </Header>

        <Divider clearing />

        <Editor
            editorState={editorState}
            readOnly={true}
            toolbarHidden={true}
            wrapperClassName="wrapper-class-preview"
            editorClassName="editor-class-preview"
            toolbarClassName="toolbar-class-hidden"
        />

        <Form size='huge' style={{marginTop: '40px'}}>
            <FormGroup widths='equal'>
            <FormField required>
             <label>First Name</label>
            <Input/>
            </FormField>
            <FormField required>
             <label>Last Name</label>
            <Input/>
            </FormField>
            </FormGroup>
            <FormGroup widths='equal'>
            <FormField required>
             <label>Email</label>
            <Input/>
            </FormField>
            <FormField required>
             <label>Phone</label>
            <Input placeholder='(###) ### - ####'/>
            </FormField>
            </FormGroup>
            {chunkQuestions(customQuestions.sort((a, b) => a.index - b.index), 2).map((chunk, index) => (
                <FormGroup widths='equal' key={index}>
                      {chunk.map((question) => (
                        <PagePreviewCustomQuestion
                        key={question.id}
                        question={question}
                        isSingle={chunk.length === 1}/>
                      ))}
                </FormGroup>
              ))}
        </Form>
           
        </div>
      </>
    )
 
})