import { DropdownProps, Segment, SegmentGroup, Select } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { Registration } from "../../app/models/registration";
import { AnswerAttachment } from "../../app/models/answerAttachment";
import CustomQuestionComponentForRegistrant from "./customQuestionComponentForRegistrant";
import { useState, useEffect } from "react";

interface OptionWithDisabled {
  id: string;
  customQuestionId: string;
  optionText: string;
  optionQuota: string;
  index: number;
  disabled: boolean;
}

interface Props {
  question: CustomQuestion;
  customQuestions: CustomQuestion[];
  registrationIsOpen: () => boolean;
  registration: Registration;
  formisDirty: boolean;
  findAnswerAttachmentByQuestionId: (questionId: string) => AnswerAttachment | null;
  answerAttachments: AnswerAttachment[];
  setAnswerAttachments: (answerAttachments: AnswerAttachment[]) => void;
  downloadAttachment: (questionId: string) => void;
  deleteAttachment: (questionId: string) => void;
  setRegistration: (newRegistration: Registration) => void;
  extendedOptions: OptionWithDisabled[];
}

export default function SelectComponentForRegistrant({
  question,
  customQuestions,
  registrationIsOpen,
  registration,
  formisDirty,
  findAnswerAttachmentByQuestionId,
  answerAttachments,
  setAnswerAttachments,
  downloadAttachment,
  deleteAttachment,
  setRegistration,
  extendedOptions,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(() => {
    const initialAnswer = registration.answers?.find(x => x.customQuestionId === question.id)?.answerText;
    return initialAnswer || '';
  });

  useEffect(() => {
    const currentAnswer = registration.answers?.find(x => x.customQuestionId === question.id)?.answerText;
    setSelectedOption(currentAnswer || '');
  }, [registration, question.id]);

  const handleCustomSelectChange = (e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    setSelectedOption(data.value?.toString() ?? '');
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
  };

  return (
    <>
      <Select
        disabled={!registrationIsOpen() && !registration.registered}
        name={question.id}
        value={selectedOption}
        search
        clearable
        placeholder='Select an option'
        onChange={handleCustomSelectChange}
        options={
          question.options
            ? question.options
                .sort((a, b) => a.index - b.index)
                .map(option => ({
                  key: option.id,
                  value: option.id,
                  text: option.optionText,
                  disabled: option.optionQuota
                    ? extendedOptions && extendedOptions.length && extendedOptions.find(opt => opt.id === option.id)
                      ? extendedOptions.find(opt => opt.id === option.id)!.disabled
                      : false
                    : false,
                }))
            : []
        }
      />
      {customQuestions
        .filter(x => x.parentQuestionOption && selectedOption && x.parentQuestionOption === selectedOption).length > 0 && (
        <SegmentGroup style={{ marginLeft: '10px' }}>
          {customQuestions
            .filter(x => x.parentQuestionOption && selectedOption && x.parentQuestionOption === selectedOption)
            .sort((a, b) => a.index - b.index)
            .map(question => (
              <Segment key={question.id}>
                <CustomQuestionComponentForRegistrant
                  question={question}
                  customQuestions={customQuestions}
                  registration={registration}
                  registrationIsOpen={registrationIsOpen}
                  formisDirty={formisDirty}
                  findAnswerAttachmentByQuestionId={findAnswerAttachmentByQuestionId}
                  setAnswerAttachments={setAnswerAttachments}
                  answerAttachments={answerAttachments}
                  downloadAttachment={downloadAttachment}
                  deleteAttachment={deleteAttachment}
                  setRegistration={setRegistration}
                  extendedOptions={extendedOptions}
                />
              </Segment>
            ))}
        </SegmentGroup>
      )}
    </>
  );
}
