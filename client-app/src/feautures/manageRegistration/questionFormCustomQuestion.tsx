import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonContent, Checkbox, FormField, FormGroup, Icon, Input, Menu, Popup, Select } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { QuestionType } from "../../app/models/questionType";

interface Props{
   question: CustomQuestion 
   handleTextChange: (newText: string, questionId: string,) => void;
   handleOptionTextChange: (newText: string, questionId: string, choiceId: string) => void;
   handleRequiredChange: (newRequired: boolean, questionId: string) => void;
   addTextQuestion: (index: number) => void;
   addChoiceQuestion: (index: number) => void;
   deleteQuestion: (id: string) => void;
   deleteChoice: (id: string, choiceId: string) => void;
   addChoice: (questionId: string, choiceIndex: number, choiceText: string) => void;
   isSingle: boolean
}
export default observer (function QuestionFormCustomQuestion(
    {question, handleTextChange, handleOptionTextChange,  handleRequiredChange, addTextQuestion, addChoiceQuestion, isSingle, deleteQuestion, deleteChoice, addChoice} : Props
){

  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {setIsOpen(true);}
  const handleClose = () => {setIsOpen(false);}

  const sortedOptions = question.options
    ? question.options
        .sort((a, b) => a.index - b.index)
        .map(option => ({
          key: option.id, // It's a good practice to include a unique key
          value: option.optionText, // Use optionText as the value
          text: option.optionText, // Use optionText for the display text
        }))
    : [];



    return (
      <>
        <FormField required={question.required} key={question.id}>
           <FormGroup widths='16'>
            <FormField width='11'>
            <input
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
            </FormField >
            <FormField  width='2'>
            <Checkbox label='Required'
          checked={question.required}
          onChange={(e, data) => handleRequiredChange(data.checked === true, question.id)} />

            </FormField>
            <FormField width='1'>
            <Button animated='vertical' color='red' basic 
            onClick={() => deleteQuestion(question.id)}>
                <ButtonContent hidden>Delete</ButtonContent>
            <ButtonContent visible>
              <Icon name='x' />
           </ButtonContent>
         </Button>
            </FormField>
            <FormField width='1'>
           
            
         <Popup
      trigger={
        <Button animated='vertical' color='green' basic
        onClick={handleOpen}>
                <ButtonContent hidden>New</ButtonContent>
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
            addTextQuestion(question.index)
            handleClose();
          }}
        >
          Input
        </Menu.Item>
        <Menu.Item
          name='choice'
          onClick={() => {
            addChoiceQuestion(question.index)
            handleClose();
          }}
        >
          Choice
        </Menu.Item>
      </Menu>
    </Popup>
  </FormField>
  </FormGroup>

  { question.options && question.options.sort((a, b) => a.index - b.index).map((option) => (
     <FormGroup widths='16'>
             <FormField width={2} />
             <FormField width='11'>
            <input
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
            <FormField width='1'>
            <Button animated='vertical' color='red' basic 
            onClick={() => deleteChoice(question.id, option.id)}>
                <ButtonContent hidden>Delete</ButtonContent>
            <ButtonContent visible>
              <Icon name='x' />
           </ButtonContent>
         </Button>
            </FormField>
         <FormField width='1'>
            <Button animated='vertical' color='green' basic 
            onClick={() => addChoice(question.id, option.index, 'Choice')}>
                <ButtonContent hidden>+Choice</ButtonContent>
            <ButtonContent visible>
              <Icon name='plus' />
           </ButtonContent>
         </Button>
            </FormField>
     </FormGroup>
  ))}


  {question.questionType === QuestionType.TextInput && <Input value={''} />}
  {question.questionType === QuestionType.Choice && (
       
        <Select
          placeholder='Select an option'
          options={sortedOptions}
        />
      )}

 </FormField>

 {isSingle && <FormField />}
 </>
    )
})