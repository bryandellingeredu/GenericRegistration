import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonContent, Checkbox, FormField, FormGroup, Icon, Input, Menu, Popup } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";

interface Props{
   question: CustomQuestion 
   handleTextChange: (newText: string, questionId: string) => void;
   addTextQuestion: (index: number) => void;
   deleteQuestion: (id: string) => void;
   isSingle: boolean
}
export default observer (function QuestionFormCustomQuestion(
    {question, handleTextChange, addTextQuestion, isSingle, deleteQuestion} : Props
){

  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {setIsOpen(true);}
  const handleClose = () => {setIsOpen(false);}

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
            <Checkbox label='Required'  />
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
            addTextQuestion(question.index)
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
  </FormField>
  </FormGroup>
  <Input value={''} />
 </FormField>

 {isSingle && <FormField />}
 </>
    )
})