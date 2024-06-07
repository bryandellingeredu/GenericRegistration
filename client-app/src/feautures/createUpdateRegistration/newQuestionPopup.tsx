import { Button, ButtonContent, Icon, Menu, Popup } from 'semantic-ui-react';
import { CustomQuestion } from '../../app/models/customQuestion';
import { QuestionOption } from '../../app/models/questionOption';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';

interface Props {
  registeredUsersIndicator: boolean;
  popoverVisibility: boolean;
  togglePopover: () => void;
  addTextQuestion: (index: number, choiceId?: string) => void;
  addChoiceQuestion: (index: number, choiceId?: string) => void;
  addAttachmentQuestion: (index: number, choiceId?: string) => void;
  index: number;
  option?: QuestionOption;
  icon: string;
  color: string;
}
export default function NewQuestionPopup({
  registeredUsersIndicator,
  popoverVisibility,
  togglePopover,
  addTextQuestion,
  addChoiceQuestion,
  addAttachmentQuestion,
  index,
  option,
  icon,
  color,
}: Props) {
  return (
    <Popup
      trigger={
        <Button
          animated="vertical"
          color={color === 'teal' ? 'teal' : 'green'}
          basic
          size="tiny"
          disabled={registeredUsersIndicator}
          onClick={() => togglePopover()}
        >
          <ButtonContent hidden>+Question</ButtonContent>
          <ButtonContent visible>
            {icon == 'branch' ? (
              <FontAwesomeIcon icon={faCodeBranch} />
            ) : (
              <Icon name="plus" />
            )}
          </ButtonContent>
        </Button>
      }
      on="click"
      open={popoverVisibility}
      onClose={() => togglePopover()}
      position="right center"
    >
      <Menu vertical>
        <Menu.Item
          name="input"
          onClick={() => {
            if (option) {
              addTextQuestion(index, option.id);
            } else {
              addTextQuestion(index);
            }
            togglePopover();
          }}
        >
          Input
        </Menu.Item>
        <Menu.Item
          name="choice"
          onClick={() => {
            if (option) {
              addChoiceQuestion(index, option.id);
            } else {
              addChoiceQuestion(index);
            }
            togglePopover();
          }}
        >
          Choice
        </Menu.Item>
        <Menu.Item
          name="attachment"
          onClick={() => {
            if (option) {
              addAttachmentQuestion(index, option.id);
            } else {
              addAttachmentQuestion(index);
            }
            togglePopover();
          }}
        >
          Attachment
        </Menu.Item>
      </Menu>
    </Popup>
  );
}
