import {
  Button,
  ButtonContent,
  ButtonGroup,
  FormField,
  FormGroup,
  Icon,
  Segment,
  SegmentGroup,
} from 'semantic-ui-react';
import { QuestionOption } from '../../app/models/questionOption';
import { CustomQuestion } from '../../app/models/customQuestion';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import NewQuestionPopup from './newQuestionPopup';
import { useState } from 'react';
import CustomQuestionComponent from './customQuestionComponent';

interface Props {
  registeredUsersIndicator: boolean;
  option: QuestionOption;
  question: CustomQuestion;
  setCustomQuestions: (newCustomQuestions: CustomQuestion[]) => void;
  setFormDirty: () => void;
  customQuestions: CustomQuestion[];
  addTextQuestion: (index: number, choiceId?: string) => void;
  addChoiceQuestion: (index: number, choiceId?: string) => void;
  addAttachmentQuestion: (index: number, choiceId?: string) => void;
}
export default function OptionComponent({
  registeredUsersIndicator,
  option,
  question,
  setCustomQuestions,
  setFormDirty,
  customQuestions,
  addTextQuestion,
  addChoiceQuestion,
  addAttachmentQuestion,
}: Props) {
  const [popoverVisibility, setPopoverVisibility] = useState(false);
  const togglePopover = () =>
    setPopoverVisibility((prevVisibility) => !prevVisibility);

  const handleOptionTextChange = (
    newText: string,
    questionId: string,
    choiceId: string,
  ) => {
    setFormDirty();
    const updatedQuestions = customQuestions.map((question) => {
      // Find the question to update
      if (question.id === questionId) {
        // Map through its options to find and update the specific choice
        const updatedOptions = question.options?.map((option) => {
          if (option.id === choiceId) {
            return { ...option, optionText: newText };
          }
          return option;
        });
        // Return the question with the updated options array
        return { ...question, options: updatedOptions };
      }
      // Return the question unchanged if it's not the one to update
      return question;
    });

    setCustomQuestions(updatedQuestions);
  };

  const handleOptionQuotaChange = (
    newQuota: string,
    questionId: string,
    choiceId: string,
  ) => {
    setFormDirty();
    const updatedQuestions = customQuestions.map((question) => {
      // Find the question to update
      if (question.id === questionId) {
        // Map through its options to find and update the specific choice
        const updatedOptions = question.options?.map((option) => {
          if (option.id === choiceId) {
            return { ...option, optionQuota: newQuota };
          }
          return option;
        });
        // Return the question with the updated options array
        return { ...question, options: updatedOptions };
      }
      // Return the question unchanged if it's not the one to update
      return question;
    });

    setCustomQuestions(updatedQuestions);
  };

  const deleteChoice = (questionId: string, choiceId: string) => {
    setFormDirty();
    const newCustomQuestions = customQuestions.map((question) => {
      if (question.id === questionId) {
        const updatedOptions = question.options!.filter(
          (option) => option.id !== choiceId,
        );
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setCustomQuestions(newCustomQuestions);
  };

  const addChoice = (
    questionId: string,
    choiceIndex: number,
    choiceText: string,
    choiceQuota: string,
  ) => {
    setFormDirty(); // Mark the form as having unsaved changes

    const newCustomQuestions = customQuestions.map((question) => {
      if (question.id === questionId) {
        // Increment the index for options that come after the new choice
        const updatedOptions = question.options!.map((option) => {
          if (option.index > choiceIndex) {
            // Change here: Use > instead of >=
            return { ...option, index: option.index + 1 };
          }
          return option;
        });

        // Insert the new choice with an index that is one more than the choiceIndex
        const newChoice = {
          id: uuidv4(),
          customQuestionId: questionId,
          optionText: choiceText,
          optionQuota: choiceQuota,
          index: choiceIndex + 1, // Change here: Increment the choiceIndex for the new choice
        };

        // Add the new choice to the options array
        updatedOptions.push(newChoice);

        // Sort options by index to ensure they are in the correct order
        updatedOptions.sort((a, b) => a.index - b.index);

        // Return the question with the updated options array
        return { ...question, options: updatedOptions };
      }
      return question;
    });

    // Update the state with the new array of questions
    setCustomQuestions(newCustomQuestions);
  };

  return (
    <>
      <FormGroup widths="16">
        <FormField width={2} />
        <FormField width="8">
          <input
            readOnly={registeredUsersIndicator}
            value={option.optionText}
            onChange={(e) =>
              handleOptionTextChange(e.target.value, question.id, option.id)
            }
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
        <FormField width="2">
          <input
            placeholder="limit"
            type="text"
            onChange={(e) => {
              //  handleOptionQuotaChange(e.target.value, question.id, option.id);
              if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                handleOptionQuotaChange(e.target.value, question.id, option.id);
              }
            }}
            value={option.optionQuota}
          />
        </FormField>
        <FormField width="2">
          <ButtonGroup size="tiny">
            <Button
              animated="vertical"
              color="red"
              basic
              size="tiny"
              onClick={() => deleteChoice(question.id, option.id)}
              disabled={registeredUsersIndicator}
            >
              <ButtonContent hidden>Delete</ButtonContent>
              <ButtonContent visible>
                <Icon name="x" />
              </ButtonContent>
            </Button>

            <Button
              animated="vertical"
              color="teal"
              basic
              size="tiny"
              disabled={registeredUsersIndicator}
              onClick={() => addChoice(question.id, option.index, 'Choice', '')}
            >
              <ButtonContent hidden>+Choice</ButtonContent>
              <ButtonContent visible>
                <Icon name="plus" />
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
              option={option}
              icon={'branch'}
              color={'teal'}
            />
          </ButtonGroup>
        </FormField>
      </FormGroup>
      <SegmentGroup
        style={
          customQuestions.filter((x) => x.parentQuestionOption === option.id)
            .length > 0
            ? {
                border: '1px dashed #000000',
              }
            : undefined
        }
      >
        {customQuestions
          .filter((x) => x.parentQuestionOption === option.id)
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
              parentOption={option}
              key={question.id}
            />
          ))}
      </SegmentGroup>
    </>
  );
}
