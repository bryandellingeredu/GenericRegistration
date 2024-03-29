import { Fragment, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { CustomQuestion } from '../../app/models/customQuestion';
import { Button, ButtonContent, ButtonGroup, Checkbox, Form, FormField, FormGroup, Icon, Input, Menu, Popup, Segment, Select } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';
import { QuestionType } from '../../app/models/questionType';

interface Props{
    customQuestions: CustomQuestion[],
    setCustomQuestions: (newCustomQuestions: CustomQuestion[]) => void;
    setFormDirty: () => void;
    registrationEventId: string
    registeredUsersIndicator: boolean
}

type PopoverVisibilityState = {
    [key: string]: boolean;
};

export default observer(function CreateUpdateRegistrationQuestions({customQuestions, setCustomQuestions, setFormDirty, registrationEventId, registeredUsersIndicator} : Props) {
    const [popoverVisibility, setPopoverVisibility] = useState<PopoverVisibilityState>({});
    const togglePopover = (questionId: string) => {
        setPopoverVisibility((prev: PopoverVisibilityState) => ({
            ...prev,
            [questionId]: !prev[questionId] // Toggle boolean value
        }));
    };
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => {setIsOpen(true);}
    const handleClose = () => {setIsOpen(false);}

    useEffect(() => {
        const initialVisibility: PopoverVisibilityState = customQuestions.reduce((acc, question) => {
            acc[question.id] = false; 
            return acc;
        }, {} as PopoverVisibilityState);
    
        setPopoverVisibility(initialVisibility);
    }, [customQuestions]); //

    const addTextQuestion = (index: number) => {
        setFormDirty();
        let newIndex = index + 1;
        const updatedQuestions = customQuestions.map(question => {
            if (question.index >= newIndex) {
                return { ...question, index: question.index + 1 };
            }
            return question;
        });
    
        const customQuestion = {
            id: uuidv4(), 
            index: newIndex,
            registrationEventId: registrationEventId, 
            questionText: 'Label',
            questionType: QuestionType.TextInput, 
            required: false
        };

        setCustomQuestions([...updatedQuestions, customQuestion]);
    };

    const addChoiceQuestion = (index: number) => {
        setFormDirty(); 
        let newIndex = index + 1;
        const updatedQuestions = customQuestions.map(question => {
            if (question.index >= newIndex) {
                return { ...question, index: question.index + 1 };
            }
            return question;
        });
    
        const questionId = uuidv4(); 

        const customOption = {
            id: uuidv4(), 
            customQuestionId: questionId, 
            optionText: 'Choice',
            index: 0 
        };
    
        // Create the new custom question
        const customQuestion = {
            id: questionId,
            registrationEventId: registrationEventId, 
            questionText: 'Label',
            questionType: QuestionType.Choice,
            required: false,
            index: newIndex,
            options: [customOption] 
        };
    
        setCustomQuestions([...updatedQuestions, customQuestion]);
    };

    const deleteChoice = (questionId: string, choiceId: string) => {
        setFormDirty(); 
        const newCustomQuestions = customQuestions.map(question => {

            if (question.id === questionId) {
                const updatedOptions = question.options!.filter(option => option.id !== choiceId);
                return { ...question, options: updatedOptions };
            }
            return question;
        });
        setCustomQuestions(newCustomQuestions);
    };
    
    

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

      const deleteQuestion = (id: string) => {
       const updatedQuestions = customQuestions.filter((question) => question.id !== id);
       setCustomQuestions(updatedQuestions);
      }

      const addChoice = (questionId: string, choiceIndex: number, choiceText: string) => {
        setFormDirty(); // Mark the form as having unsaved changes
    
        const newCustomQuestions = customQuestions.map(question => {
            if (question.id === questionId) {
                // Increment the index for options that come after the new choice
                const updatedOptions = question.options!.map(option => {
                    if (option.index > choiceIndex) { // Change here: Use > instead of >=
                        return { ...option, index: option.index + 1 };
                    }
                    return option;
                });
    
                // Insert the new choice with an index that is one more than the choiceIndex
                const newChoice = {
                    id: uuidv4(), 
                    customQuestionId: questionId,
                    optionText: choiceText,
                    index: choiceIndex + 1, // Change here: Increment the choiceIndex for the new choice
                };
    
                // Add the new choice to the options array
                updatedOptions.push(newChoice);
    
                // Sort options by index to ensure they are in the correct order
                updatedOptions.sort((a, b) => a.index - b.index);
    
                // Return the question with the updated options array
                return { ...question, options: updatedOptions };
            }
            return question;
        });
    
        // Update the state with the new array of questions
        setCustomQuestions(newCustomQuestions);
    };
    

    return(
        <>
    <Form>
    <FormGroup>
            <FormField width='9'>
            <input
              value={'First Name'}
              style={{
                border: 'none',
                borderBottom: '1px solid #ddd',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
            </FormField>
            <FormField  width='3'>
            <Checkbox label='Required'
                checked
             />
            </FormField>
        </FormGroup>
        <FormGroup>
            <FormField width='9'>
            <input
              readOnly={registeredUsersIndicator}
              value={'Last Name'}
              style={{
                border: 'none',
                borderBottom: '1px solid #ddd',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
            </FormField>
            <FormField  width='3'>
            <Checkbox label='Required'
                checked
             />
            </FormField>
        </FormGroup>
       
 
        <FormGroup>
            <FormField width='9'>
            <input
              value={'Email'}
              style={{
                border: 'none',
                borderBottom: '1px solid #ddd',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
            </FormField>
            <FormField  width='3'>
            <Checkbox label='Required'
                checked
             />
            </FormField>
        </FormGroup>
        {
          customQuestions.sort((a, b) => a.index - b.index).map((question) => (
            <Segment key={question.id} style={{backgroundColor: '#f4f4f4'}}>
         <FormGroup>
            <FormField width='9'>
            <input
              readOnly={registeredUsersIndicator}
              value={question.questionText}
              onChange={(e) => handleTextChange(e.target.value, question.id)}
              style={{
                border: 'none',
                borderBottom: '1px solid #ddd',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
            </FormField>
            <FormField  width='3'>
            <Checkbox label='Required'
                readOnly={registeredUsersIndicator}
                checked={question.required}
                onChange={(e, data) => handleRequiredChange(data.checked === true, question.id)}
             />

            </FormField>
            <FormField width='4'>
            <ButtonGroup size='tiny'>
            <Button animated='vertical' color='red' basic size='tiny'
            disabled={registeredUsersIndicator} 
            onClick={() => deleteQuestion(question.id)}
            >
                <ButtonContent hidden>Delete</ButtonContent>
            <ButtonContent visible>
              <Icon name='x' />
           </ButtonContent>
         </Button>
                     
            <Popup
    key={question.id} // Ensure each Popup has a unique key
    trigger={
      <Button animated='vertical' color='green' basic size='tiny'
      disabled={registeredUsersIndicator} 
      onClick={() => togglePopover(question.id)}> {/* Toggle visibility for this specific question */}
        <ButtonContent hidden>+Question</ButtonContent>
        <ButtonContent visible>
          <Icon name='plus' />
        </ButtonContent>
      </Button>
    }
    on='click'
    open={popoverVisibility[question.id] || false} // Control this Popup's visibility based on its specific state
    onClose={() => togglePopover(question.id)} // Use togglePopover to close
    position='right center'
  >
    <Menu vertical>
      <Menu.Item
        name='input'
        onClick={() => {
          addTextQuestion(question.index);
          togglePopover(question.id); // Close the popup after action
        }}
      >
        Input
      </Menu.Item>
      <Menu.Item
        name='choice'
        onClick={() => {
          addChoiceQuestion(question.index);
          togglePopover(question.id); // Close the popup after action
        }}
      >
        Choice
      </Menu.Item>
    </Menu>
  </Popup>
  </ButtonGroup>
    </FormField>
    </FormGroup>

    { question.options && question.options.sort((a, b) => a.index - b.index).map((option) => (
     <FormGroup widths='16'>
             <FormField width={2} />
             <FormField width='8'>
            <input
              readOnly={registeredUsersIndicator} 
              value={option.optionText}
              onChange={(e) => handleOptionTextChange(e.target.value, question.id, option.id)}
              style={{
                border: 'none',
                borderBottom: '1px solid #ddd',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                height: 'auto',
                backgroundColor: 'transparent',
              }}
            />
            </FormField>
            <FormField width='2'>
              <ButtonGroup size='tiny'>
            <Button animated='vertical' color='red' basic size='tiny'
            onClick={() => deleteChoice(question.id, option.id)}
            disabled={registeredUsersIndicator} 
           >
                <ButtonContent hidden>Delete</ButtonContent>
            <ButtonContent visible>
              <Icon name='x' />
           </ButtonContent>
         </Button>
        
            <Button animated='vertical' color='teal' basic size='tiny'
             disabled={registeredUsersIndicator} 
            onClick={() => addChoice(question.id, option.index, 'Choice')}
            >
                <ButtonContent hidden>+Choice</ButtonContent>
            <ButtonContent visible>
              <Icon name='plus' />
           </ButtonContent>
         </Button>
         </ButtonGroup>
            </FormField>
     </FormGroup>
  ))}

       {/* <FormField required={question.required}>
            {question.questionType === QuestionType.TextInput &&  <Input value={''} placeholder={question.questionText} />}
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
          </FormField> */}

    </Segment>
  ))
}


    </Form>

        <Segment>
        <Popup
      trigger={
        <Button icon labelPosition='left' basic color='green' onClick={handleOpen} disabled={registeredUsersIndicator} >

        <Icon name='plus' />
        Add a Question
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
            addTextQuestion(customQuestions.length > 0 ? Math.max(...customQuestions.map(x => x.index)) : 0);
            handleClose();
          }}
        >
          Input
        </Menu.Item>
        <Menu.Item
          name='choice'
          onClick={() => {
            addChoiceQuestion(customQuestions.length > 0 ? Math.max(...customQuestions.map(x => x.index)) : 0);
            handleClose();
          }}
        >
          Choice
        </Menu.Item>
      </Menu>
    </Popup>
         </Segment>

    </>
    )
})