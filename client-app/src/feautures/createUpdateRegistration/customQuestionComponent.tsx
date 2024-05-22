import { Button, ButtonContent, ButtonGroup, Checkbox, FormField, FormGroup, Icon, Menu, Popup, Segment } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { QuestionType } from "../../app/models/questionType";
import { useState } from "react";
import OptionComponent from "./optionComponent";
import NewQuestionPopup from "./newQuestionPopup";

interface Props{
    customQuestions: CustomQuestion[],
    question: CustomQuestion
    registeredUsersIndicator: boolean
    setCustomQuestions: (newCustomQuestions: CustomQuestion[]) => void;
    setFormDirty: () => void;
    addTextQuestion: (index: number) =>void;
    addChoiceQuestion: (index: number) => void
    addAttachmentQuestion: (index: number) => void
}
export default function CustomQuestionComponent(
    {question, registeredUsersIndicator, setCustomQuestions, setFormDirty, customQuestions,
     addTextQuestion, addChoiceQuestion, addAttachmentQuestion  } : Props){
    
     const [popoverVisibility, setPopoverVisibility] = useState(false);
     const togglePopover = () => setPopoverVisibility(prevVisibility => !prevVisibility);

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

    return(
        <Segment  style={{backgroundColor: '#f4f4f4'}}>
        <FormGroup>
           <FormField width='9'>
           {question.questionType === QuestionType.Attachment && <Icon name='paperclip' />}
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
                    
         <NewQuestionPopup 
           registeredUsersIndicator={registeredUsersIndicator}
           popoverVisibility={popoverVisibility}
           togglePopover={togglePopover}
           addTextQuestion={addTextQuestion}
           addChoiceQuestion={addChoiceQuestion}
           addAttachmentQuestion={addAttachmentQuestion}
           index={question.index}
         />
 </ButtonGroup>
   </FormField>
   </FormGroup>

   { question.options && question.options.sort((a, b) => a.index - b.index).map((option) => (
    <OptionComponent
       key={option.id}
       registeredUsersIndicator={registeredUsersIndicator}
       option={option}
       question={question}
       setCustomQuestions={setCustomQuestions}
       customQuestions={customQuestions}
       setFormDirty={setFormDirty}
     />
 ))}
   </Segment> 
    )
}