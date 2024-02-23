import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonContent, Checkbox, Divider, Form, FormField, FormGroup, Header, Icon, Input, Menu, Message, Popup, Segment, Select } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { QuestionType } from "../../app/models/questionType";
import QuestionFormCustomQuestion from "./questionFormCustomQuestion";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  registrationEventId : string
  setNextActiveStep: () => void
  setPreviousActiveStep: () => void
  formIsDirty: boolean
  setFormDirty: () => void
  setFormClean: () => void
}

export default observer ( function QuestionsForm(
  {registrationEventId, setNextActiveStep, setPreviousActiveStep,
    formIsDirty, setFormDirty, setFormClean } : Props
) {

  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {setIsOpen(true);}
  const handleClose = () => {setIsOpen(false);}
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {

  }, []);

  const chunkQuestions = (questions: CustomQuestion[], size: number): CustomQuestion[][] =>
  questions.reduce<CustomQuestion[][]>((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = []; // start a new chunk
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);

  const handleTextChange = (newText : string, questionId : string) => {
    // Create a new array with the updated question
    const updatedQuestions = customQuestions.map(question => {
      if (question.id === questionId) {
        return { ...question, questionText: newText };
      }
      return question;
    });
  
    // Update the state with the new questions array
    setCustomQuestions(updatedQuestions);
  };

  const deleteQuestion = (id: string) => {
    setCustomQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== id));
  }

  const addTextQuestion = (index: number) => {
    setCustomQuestions((prevQuestions) => {
      let newIndex = index + 1;
      // Update indexes of existing questions if necessary
      const updatedQuestions = prevQuestions.map(question => {
        if (question.index >= newIndex) {
          return { ...question, index: question.index + 1 };
        }
        return question;
      });
  
      // Create the new custom question
      const customQuestion = {
        id: uuidv4(),
        index: newIndex,
        registrationEventId: registrationEventId, // Assuming registrationEventId is in scope
        questionText: 'Type Here To Enter Your Question`s Label',
        questionType: QuestionType.TextInput,
        required: false
      };
  
      // Add the new question to the end
      return [...updatedQuestions, customQuestion];
    });
  };

    return(
      <>
        <Divider horizontal>
    <Header as='h2'>
      <Icon name='question' />
      Questions
    </Header>
  </Divider>
  <div style={{padding: '40px'}}>
  <Message info>
                <Header textAlign="center">
                  Name  Email  and Phone are required questions. Use the button to add your own questions
                </Header>
  </Message>


  <Form size='huge' style={{marginTop: '40px'}}>
            <FormGroup widths='equal'>
            <FormField required>
             <label>First Name</label>
            <Input value={''}/>
            </FormField>
            <FormField required>
             <label>Last Name</label>
            <Input value={''}/>
            </FormField >
            </FormGroup>
            <FormGroup widths='equal'>
            <FormField required>
             <label> Email</label>
            <Input value={''}/>
            </FormField>
            <FormField required>
             <label>Phone</label>
            <Input placeholder='(###) ### - ####' value={''}/>
            </FormField>
            </FormGroup>

  {chunkQuestions(customQuestions.sort((a, b) => a.index - b.index), 2).map((chunk, index) => (
    <FormGroup widths='equal' key={index}>
      {chunk.map((question) => (
        <QuestionFormCustomQuestion
         key={question.id}
         question={question}
         handleTextChange={handleTextChange}
         addTextQuestion={addTextQuestion}
         deleteQuestion={deleteQuestion}
         isSingle={chunk.length === 1}
         />
      ))}
    </FormGroup>
  ))}

        </Form>

      {customQuestions.length < 1  && 
        <Segment>
        <Popup
      trigger={
        <Button animated='vertical' color='green' basic
        onClick={handleOpen}>
                <ButtonContent hidden>Add New</ButtonContent>
            <ButtonContent visible>
              <Icon name='plus' />
           </ButtonContent>
         </Button>
      }
      on='click'
      open={isOpen}
      onClose={handleClose}
      position='right center'
    >
      <Menu vertical>
        <Menu.Item
          name='input'
          onClick={() => {
            addTextQuestion(0);
            handleClose();
          }}
        >
          Input
        </Menu.Item>
        <Menu.Item
          name='choice'
          onClick={() => {
            console.log('Choice Selected');
            handleClose();
          }}
        >
          Choice
        </Menu.Item>
      </Menu>
    </Popup>
         </Segment>
}

  <Button type="button"
     size="huge" color="teal" floated="left"
     icon labelPosition='left'
      onClick={() => setPreviousActiveStep()}>
    Back To Details
    <Icon name='arrow left' />
    </Button>
  <Button type="button"
     size="huge" color="teal" floated="right"
     icon labelPosition='right'
      onClick={() => setNextActiveStep()}>
    Go To Design
    <Icon name='arrow right' />
    </Button>
    </div>
</>
    )
})