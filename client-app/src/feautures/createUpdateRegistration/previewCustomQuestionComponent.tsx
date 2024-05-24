import { Divider, FormField, Grid, Icon, Input, Select } from "semantic-ui-react"
import { CustomQuestion } from "../../app/models/customQuestion"
import { QuestionType } from "../../app/models/questionType"
import DocumentUploadWidget from "../documentUpload/documentUploadWidget"
import PreviewSelect from "./previewSelect"

interface Props{
    question: CustomQuestion
    customQuestions : CustomQuestion[]
}


export default function PreviewCustomQuestionComponent({question, customQuestions} :Props){

    function handleUpload(file: any) {
        //do nothing
       }
    
    

    return(
        <FormField  required={question.required}>
        {question.questionType !== QuestionType.Attachment && <label>{question.questionText}</label> }
        {question.questionType === QuestionType.TextInput && <Input value={''}/>}
        {question.questionType === QuestionType.Choice &&
          <PreviewSelect question={question} customQuestions={customQuestions} />
        }
        {question.questionType == QuestionType.Attachment &&
        <>
          <Divider color="black" />
          <Grid>
            <Grid.Row>
              <Grid.Column width={4}>
                <strong>{question.questionText}:</strong>
                {question.required && <Icon name='asterisk' color='red' /> } 
              </Grid.Column>
              <Grid.Column width={12}>
                <DocumentUploadWidget
                  uploadDocument={handleUpload}
                  loading={false}
                  color={'black'}
                  questionId={question.id}
                  error={false}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider color="black" />
          </> 
        }
      </FormField>
    )
}
