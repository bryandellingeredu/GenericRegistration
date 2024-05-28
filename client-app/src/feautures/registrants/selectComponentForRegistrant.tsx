import { DropdownProps, Select } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { Registration } from "../../app/models/registration";
import { AnswerAttachment } from "../../app/models/answerAttachment";

interface OptionWithDisabled{
    id: string;
    customQuestionId: string;
    optionText: string;
    optionQuota: string;
    index: number
    disabled: boolean;
  }


interface Props{
    question: CustomQuestion
    customQuestions : CustomQuestion[]
    registrationIsOpen : () => boolean
    registration: Registration
    formisDirty: boolean
    findAnswerAttachmentByQuestionId: (questionId: string) => AnswerAttachment | null
    answerAttachments: AnswerAttachment[]
    setAnswerAttachments: (answerAttachments: AnswerAttachment[]) => void
    downloadAttachment: (questionId : string) => void
    deleteAttachment: (questionId : string) => void
    setRegistration: (newRegistration : Registration) => void
    extendedOptions: OptionWithDisabled[]
}


export default function SelectComponentForRegistrant(
    {question, customQuestions, registrationIsOpen, registration, formisDirty, findAnswerAttachmentByQuestionId,
        answerAttachments, setAnswerAttachments, downloadAttachment, deleteAttachment, setRegistration, extendedOptions
      } : Props
){
    const handleCustomSelectChange = (e: React.SyntheticEvent<HTMLElement>, data: DropdownProps ) =>{
        const name = data.name as string;
        const value = data.value ?? '';
        const updatedRegistration = { ...registration };
        if (updatedRegistration.answers) {
          const answerIndex = updatedRegistration.answers.findIndex(answer => answer.customQuestionId === name);
          if (answerIndex !== -1) {
            updatedRegistration.answers[answerIndex] = { ...updatedRegistration.answers[answerIndex], answerText: value as string };
            setRegistration(updatedRegistration);
          }
        }
      }

    return(
        <Select
        disabled={!registrationIsOpen() && !registration.registered }
        name={question.id}
        value={registration.answers?.find(x => x.customQuestionId === question.id)?.answerText || ''}
        search
        clearable
        placeholder='Select an option'
        onChange={(e, data) => handleCustomSelectChange(e, data)}
        options={ question.options
           ? question.options
               .sort((a, b) => a.index - b.index)
               .map(option => ({
                 key: option.id, 
                 value: option.optionText, 
                 text: option.optionText, 
                 disabled: option.optionQuota ?
                 extendedOptions && extendedOptions.length && extendedOptions.find(opt => opt.id === option.id) ?
                 extendedOptions.find(opt => opt.id === option.id)!.disabled
                 : false
               : false
       
               }))
           : []}
      />
    )
}