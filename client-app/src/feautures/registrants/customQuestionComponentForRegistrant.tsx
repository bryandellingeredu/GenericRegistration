import {
  Button,
  ButtonContent,
  ButtonGroup,
  Divider,
  DropdownProps,
  FormField,
  Icon,
  Input,
  Loader,
  Select,
} from 'semantic-ui-react';
import { CustomQuestion } from '../../app/models/customQuestion';
import { Registration } from '../../app/models/registration';
import { QuestionType } from '../../app/models/questionType';
import { AnswerAttachment } from '../../app/models/answerAttachment';
import DocumentUploadWidget from '../documentUpload/documentUploadWidget';
import { v4 as uuid } from 'uuid';
import { useStore } from '../../app/stores/store';
import { toast } from 'react-toastify';
import SelectComponentForRegistrant from './selectComponentForRegistrant';

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
  findAnswerAttachmentByQuestionId: (
    questionId: string,
  ) => AnswerAttachment | null;
  answerAttachments: AnswerAttachment[];
  setAnswerAttachments: (answerAttachments: AnswerAttachment[]) => void;
  downloadAttachment: (questionId: string) => void;
  deleteAttachment: (questionId: string) => void;
  setRegistration: (newRegistration: Registration) => void;
  extendedOptions: OptionWithDisabled[];
}
export default function CustomQuestionComponentForRegistrant({
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
  const { attachmentStore } = useStore();
  const { uploadAnswerDocument, uploading } = attachmentStore;

  const handleDocumentUpload = async (file: any, customQuestionId: string) => {
    const answerAttachmentId = uuid();
    const fileName = file.name;
    const fileType = file.type;
    try {
      await uploadAnswerDocument(
        file,
        answerAttachmentId,
        customQuestionId,
        registration.id,
      );

      const answerAttachment: AnswerAttachment = {
        id: answerAttachmentId,
        customQuestionLookup: customQuestionId,
        registrationLookup: registration.id,
        fileName: fileName,
        fileType: fileType,
      };

      setAnswerAttachments([...answerAttachments, answerAttachment]);
    } catch (error: any) {
      console.log(error);
      toast.error(`Error uploading ${fileName}: ${error.message}`);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedRegistration = { ...registration };
    if (updatedRegistration.answers) {
      const answerIndex = updatedRegistration.answers.findIndex(
        (answer) => answer.customQuestionId === name,
      );
      if (answerIndex !== -1) {
        updatedRegistration.answers[answerIndex] = {
          ...updatedRegistration.answers[answerIndex],
          answerText: value,
        };
        setRegistration(updatedRegistration);
      }
    }
  };

  return (
    <div id={question.id}>
      <FormField
        key={question.id}
        required={question.required}
        disabled={!registrationIsOpen() && !registration.registered}
        error={
          formisDirty &&
          question.required &&
          ((question.questionType !== QuestionType.Attachment &&
            (!registration.answers?.find(
              (x) => x.customQuestionId === question.id,
            )?.answerText ||
              !registration.answers
                ?.find((x) => x.customQuestionId === question.id)
                ?.answerText.trim())) ||
            (question.questionType === QuestionType.Attachment &&
              !findAnswerAttachmentByQuestionId(question.id)))
        }
      >
        <label>{question.questionText}</label>
        {question.questionType === QuestionType.Attachment && uploading && (
          <Loader active inline />
        )}

        {question.questionType === QuestionType.Attachment &&
          !findAnswerAttachmentByQuestionId(question.id) &&
          !uploading && (
            <>
              <Divider color="black" />
              {(registrationIsOpen() || registration.registered) && (
                <DocumentUploadWidget
                  uploadDocument={handleDocumentUpload}
                  loading={uploading}
                  color={'black'}
                  questionId={question.id}
                  error={
                    formisDirty &&
                    question.required &&
                    !findAnswerAttachmentByQuestionId(question.id)
                  }
                />
              )}
              <Divider color="black" />
            </>
          )}
        {question.questionType === QuestionType.Attachment &&
          !uploading &&
          findAnswerAttachmentByQuestionId(question.id)?.fileName && (
            <ButtonGroup>
              <Button
                animated="vertical"
                basic
                color="blue"
                onClick={() => downloadAttachment(question.id)}
                type="button"
              >
                <ButtonContent hidden>Download</ButtonContent>
                <ButtonContent visible>
                  <Icon name="paperclip" />
                  {findAnswerAttachmentByQuestionId(question.id)?.fileName}
                </ButtonContent>
              </Button>
              <Button
                animated="vertical"
                basic
                color="red"
                onClick={() => deleteAttachment(question.id)}
                type="button"
              >
                <ButtonContent hidden>Delete</ButtonContent>
                <ButtonContent visible>
                  <Icon name="x" />
                </ButtonContent>
              </Button>
            </ButtonGroup>
          )}
        {question.questionType === QuestionType.TextInput && (
          <Input
            value={
              registration.answers?.find(
                (x) => x.customQuestionId === question.id,
              )?.answerText
            }
            disabled={!registrationIsOpen() && !registration.registered}
            name={question.id}
            onChange={handleCustomInputChange}
          />
        )}
        {question.questionType === QuestionType.Choice && (
          <SelectComponentForRegistrant
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
        )}
      </FormField>
    </div>
  );
}
