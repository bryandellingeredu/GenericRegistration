import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonContent, Checkbox, Divider, Form, FormField, FormGroup, Header, Icon, Input, Menu, Message, Popup, Segment, Select } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { QuestionType } from "../../app/models/questionType";
import QuestionFormCustomQuestion from "./questionFormCustomQuestion";
import { v4 as uuidv4 } from 'uuid';
import LoadingComponent from "../../app/layout/LoadingComponent";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { QuestionOption } from "../../app/models/questionOption";

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomQuestions();
  }, [registrationEventId]);

  const getCustomQuestions = async () => {
    if(registrationEventId){
      setLoading(true);
      try{
        const data : CustomQuestion[] = await agent.CustomQuestions.details(registrationEventId);
        if(data && data.length) setCustomQuestions(data);
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
  }

  const handleSave = async () =>{
    setSaving(true);
    try{
      await agent.CustomQuestions.createUpdate(registrationEventId, customQuestions);
      setFormClean();
      setNextActiveStep();
     }catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("An error occured saving data");
        }
      }finally {
        setSaving(false);
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

  const handleRequiredChange = (newRequired: boolean, questionId: string) =>{
    setFormDirty();
    const updatedQuestions = customQuestions.map(question => {
      if (question.id === questionId) {
        return { ...question, required: newRequired };
      }
      return question;
    });
  
    setCustomQuestions(updatedQuestions);
  }

  const handleTextChange = (newText : string, questionId : string) => {
    setFormDirty();
    const updatedQuestions = customQuestions.map(question => {
      if (question.id === questionId) {
        return { ...question, questionText: newText };
      }
      return question;
    });
  
    setCustomQuestions(updatedQuestions);
  };

  const handleOptionTextChange = (newText: string, questionId: string, choiceId: string) => {
    setFormDirty();
    const updatedQuestions = customQuestions.map(question => {
      // Find the question to update
      if (question.id === questionId) {
        // Map through its options to find and update the specific choice
        const updatedOptions = question.options?.map(option => {
          if (option.id === choiceId) {
            return { ...option, optionText: newText };
          }
          return option;
        });
        // Return the question with the updated options array
        return { ...question, options: updatedOptions };
      }
      // Return the question unchanged if it's not the one to update
      return question;
    });
  
    setCustomQuestions(updatedQuestions);
  };

  const deleteQuestion = (id: string) => {
    setFormDirty();
    setCustomQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== id));
  }

  const deleteChoice = (questionId: string, choiceId: string) => {
    setFormDirty();
    setCustomQuestions((prevQuestions) => prevQuestions.map(question => {
      // Check if this is the question from which we want to delete a choice
      if (question.id === questionId) {
        // Proceed only if there are more than one options available
        if (question.options && question.options.length > 1) {
          const updatedOptions = question.options.filter(option => option.id !== choiceId);
          // Return the question with the updated choices array
          return { ...question, options: updatedOptions };
        } else {
          // If deleting would result in an empty array, return the question unchanged
          return question;
        }
      }
      // Return the question unchanged if it's not the one to update
      return question;
    }));
  };

  const addTextQuestion = (index: number) => {
    setFormDirty();
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

  const addChoiceQuestion = (index: number) => {
    setFormDirty();
    setCustomQuestions((prevQuestions) => {
      let newIndex = index + 1;
      // Update indexes of existing questions if necessary
      const updatedQuestions = prevQuestions.map(question => {
        if (question.index >= newIndex) {
          return { ...question, index: question.index + 1 };
        }
        return question;
      });
      
      const questionId = uuidv4();
      // Create the new custom question option
      const customOption = {
        id: uuidv4(),
        customQuestionId: questionId,
        optionText: 'Choice',
        index: 0 // Assuming you're starting the options index at 0
      };
      // Ensure to use 'options' to match the CustomQuestion interface
      const customQuestion = {
        id: questionId,
        registrationEventId: registrationEventId, // Assuming registrationEventId is in scope
        questionText: 'Type Here To Enter Your Question`s Label',
        questionType: QuestionType.Choice,
        required: false,
        index: newIndex,
        options: [customOption] // Correctly named to match the interface
      };
  
      // Add the new question to the end of the updated questions array
      return [...updatedQuestions, customQuestion];
    });
  };

  const addChoice = (questionId: string, choiceIndex: number, choiceText: string) => {
    setFormDirty();
    setCustomQuestions(prevQuestions => prevQuestions.map(question => {
        if (question.id === questionId) {
            // Increment indexes of existing choices that come after the new choice
            const updatedOptions = question.options ? question.options.map(option => {
                if (option.index > choiceIndex) { // Only increment options after the current index
                    return { ...option, index: option.index + 1 };
                }
                return option;
            }) : [];
    
            // Add the new choice with an index that is one more than the choiceIndex
            const newChoice = {
                id: uuidv4(), // Assuming uuidv4() is available for generating unique IDs
                customQuestionId: questionId,
                optionText: choiceText,
                index: choiceIndex + 1,
            };
    
            // Add the new choice to the options array
            updatedOptions.push(newChoice);
    
            // Sort options by index to ensure correct order
            return { ...question, options: updatedOptions.sort((a, b) => a.index - b.index) };
        }
        return question;
    }));
};



  if (loading) return <LoadingComponent content="Loading Questions..."/>
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
         handleOptionTextChange={handleOptionTextChange}
         handleRequiredChange={handleRequiredChange}
         addTextQuestion={addTextQuestion}
         addChoiceQuestion={addChoiceQuestion}
         deleteQuestion={deleteQuestion}
         deleteChoice={deleteChoice}
         addChoice={addChoice}
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
  {!formIsDirty && 
  <Button type="button"
     size="huge" color="teal" floated="right"
     icon labelPosition='right'
      onClick={() => setNextActiveStep()}>
    Go To Design
    <Icon name='arrow right' />
    </Button>
  }
   {formIsDirty && 
  <Button type="button"
     size="huge" color="teal" floated="right"
     icon labelPosition='right'
      onClick={handleSave} loading={saving}>
    Save and Continue
    <Icon name='arrow right' />
    </Button>
  }
    </div>
</>
    )
})