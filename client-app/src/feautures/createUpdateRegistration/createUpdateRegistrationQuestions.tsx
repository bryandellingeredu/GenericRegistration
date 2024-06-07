import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { CustomQuestion } from '../../app/models/customQuestion';
import {
  Checkbox,
  Form,
  FormField,
  FormGroup,
  Segment,
} from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';
import { QuestionType } from '../../app/models/questionType';
import CustomQuestionComponent from './customQuestionComponent';
import NewQuestionPopup from './newQuestionPopup';

interface Props {
  customQuestions: CustomQuestion[];
  setCustomQuestions: (newCustomQuestions: CustomQuestion[]) => void;
  setFormDirty: () => void;
  registrationEventId: string;
  registeredUsersIndicator: boolean;
}

export default observer(function CreateUpdateRegistrationQuestions({
  customQuestions,
  setCustomQuestions,
  setFormDirty,
  registrationEventId,
  registeredUsersIndicator,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const togglePopover = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const addTextQuestion = (index: number, choiceId?: string) => {
    setFormDirty();
    let newIndex = index + 1;
    const updatedQuestions = customQuestions.map((question) => {
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
      required: false,
      parentQuestionOption: choiceId || '',
    };

    setCustomQuestions([...updatedQuestions, customQuestion]);
  };

  const addAttachmentQuestion = (index: number, choiceId?: string) => {
    setFormDirty();
    let newIndex = index + 1;
    const updatedQuestions = customQuestions.map((question) => {
      if (question.index >= newIndex) {
        return { ...question, index: question.index + 1 };
      }
      return question;
    });

    const customQuestion = {
      id: uuidv4(),
      index: newIndex,
      registrationEventId: registrationEventId,
      questionText: 'Upload your document',
      questionType: QuestionType.Attachment,
      required: false,
      parentQuestionOption: choiceId || '',
    };

    setCustomQuestions([...updatedQuestions, customQuestion]);
  };

  const addChoiceQuestion = (index: number, choiceId?: string) => {
    setFormDirty();
    let newIndex = index + 1;
    const updatedQuestions = customQuestions.map((question) => {
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
      optionQuota: '',
      index: 0,
    };

    const customQuestion = {
      id: questionId,
      registrationEventId: registrationEventId,
      questionText: 'Label',
      questionType: QuestionType.Choice,
      required: false,
      index: newIndex,
      options: [customOption],
      parentQuestionOption: choiceId || '',
    };

    setCustomQuestions([...updatedQuestions, customQuestion]);
  };

  return (
    <>
      <Form>
        <FormGroup>
          <FormField width="9">
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
          <FormField width="3">
            <Checkbox label="Required" checked />
          </FormField>
        </FormGroup>
        <FormGroup>
          <FormField width="9">
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
          <FormField width="3">
            <Checkbox label="Required" checked />
          </FormField>
        </FormGroup>

        <FormGroup>
          <FormField width="9">
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
          <FormField width="3">
            <Checkbox label="Required" checked />
          </FormField>
        </FormGroup>
        {customQuestions
          .filter((x) => !x.parentQuestionOption)
          .sort((a, b) => a.index - b.index)
          .map((question) => (
            <CustomQuestionComponent
              question={question}
              registeredUsersIndicator={registeredUsersIndicator}
              customQuestions={customQuestions}
              setCustomQuestions={setCustomQuestions}
              setFormDirty={setFormDirty}
              addTextQuestion={addTextQuestion}
              addChoiceQuestion={addChoiceQuestion}
              addAttachmentQuestion={addAttachmentQuestion}
              key={question.id}
            />
          ))}
      </Form>

      <Segment>
        <NewQuestionPopup
          togglePopover={togglePopover}
          registeredUsersIndicator={registeredUsersIndicator}
          popoverVisibility={isOpen}
          addTextQuestion={addTextQuestion}
          addChoiceQuestion={addChoiceQuestion}
          addAttachmentQuestion={addAttachmentQuestion}
          index={
            customQuestions.length > 0
              ? Math.max(...customQuestions.map((x) => x.index))
              : 0
          }
          icon={'plus'}
          color={'green'}
        />
      </Segment>
    </>
  );
});
