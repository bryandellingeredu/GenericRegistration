import { observer } from "mobx-react-lite";
import { FormField, Input, Select} from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { QuestionType } from "../../app/models/questionType";

interface Props{
    question: CustomQuestion; 
    isSingle: boolean;
}

export default observer (function PagePreviewCustomQuestion({question, isSingle} : Props){

  const sortedOptions = question.options
  ? question.options
      .sort((a, b) => a.index - b.index)
      .map(option => ({
        key: option.id, // It's a good practice to include a unique key
        value: option.optionText, // Use optionText as the value
        text: option.optionText, // Use optionText for the display text
      }))
  : [];
    return(
        <>
         <FormField required={question.required} key={question.id} >
         <label>{question.questionText}</label>
           {question.questionType === QuestionType.TextInput && <Input value={''}/> }
           {question.questionType === QuestionType.Choice &&
             <Select placeholder='Select an option' options={sortedOptions}/> }
         </FormField>
         {isSingle && <FormField />}
       </>
    )
})