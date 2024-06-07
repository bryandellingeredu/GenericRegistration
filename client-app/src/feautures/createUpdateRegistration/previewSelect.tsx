import { Container, Segment, SegmentGroup, Select } from 'semantic-ui-react';
import { CustomQuestion } from '../../app/models/customQuestion';
import { useState } from 'react';
import PreviewCustomQuestionComponent from './previewCustomQuestionComponent';

interface Props {
  question: CustomQuestion;
  customQuestions: CustomQuestion[];
}

export default function PreviewSelect({ question, customQuestions }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined,
  );

  const handleChange = (e: React.SyntheticEvent<HTMLElement>, data: any) => {
    setSelectedOption(data.value);
    console.log('Selected option:', data.value);
    // Additional logic can be added here
  };

  return (
    <>
      <Select
        search
        clearable
        placeholder="Select an option"
        options={
          question.options
            ? question.options
                .sort((a, b) => a.index - b.index)
                .map((option) => ({
                  key: option.id,
                  value: option.id,
                  text: option.optionText,
                }))
            : []
        }
        onChange={handleChange}
        value={selectedOption}
      />
      {customQuestions.filter(
        (x) =>
          x.parentQuestionOption &&
          selectedOption &&
          x.parentQuestionOption === selectedOption,
      ).length > 0 && (
        <SegmentGroup style={{ marginLeft: '10px' }}>
          {customQuestions
            .filter(
              (x) =>
                x.parentQuestionOption &&
                selectedOption &&
                x.parentQuestionOption === selectedOption,
            )
            .sort((a, b) => a.index - b.index)
            .map((question) => (
              <Segment key={question.id}>
                <PreviewCustomQuestionComponent
                  question={question}
                  customQuestions={customQuestions}
                />
              </Segment>
            ))}
        </SegmentGroup>
      )}
    </>
  );
}
