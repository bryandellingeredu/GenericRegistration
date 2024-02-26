import { observer } from "mobx-react-lite";
import { FormField, Input} from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";

interface Props{
    question: CustomQuestion; 
    isSingle: boolean;
}

export default observer (function PagePreviewCustomQuestion({question, isSingle} : Props){
    return(
        <>
         <FormField required={question.required} key={question.id} >
         <label>{question.questionText}</label>
           <Input value={''}/>
         </FormField>
         {isSingle && <FormField />}
       </>
    )
})