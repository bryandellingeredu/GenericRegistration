import { Button, ButtonContent, Icon, Menu, Popup } from "semantic-ui-react";
import { CustomQuestion } from "../../app/models/customQuestion";

interface Props{
    registeredUsersIndicator: boolean
    popoverVisibility: boolean
    togglePopover: () => void;
    addTextQuestion: (index: number) =>void;
    addChoiceQuestion: (index: number) => void
    addAttachmentQuestion: (index: number) => void
    index: number
}
export default function NewQuestionPopup(
    {registeredUsersIndicator, popoverVisibility, togglePopover,
         addTextQuestion, addChoiceQuestion, addAttachmentQuestion, index } : Props){
    return(
        <Popup
        trigger={
          <Button animated='vertical' color='green' basic size='tiny'
          disabled={registeredUsersIndicator} 
          onClick={() => togglePopover()}> 
            <ButtonContent hidden>+Question</ButtonContent>
            <ButtonContent visible>
              <Icon name='plus' />
            </ButtonContent>
          </Button>
        }
        on='click'
        open={popoverVisibility} 
        onClose={() => togglePopover()} 
        position='right center'
      >
        <Menu vertical>
          <Menu.Item
            name='input'
            onClick={() => {
              addTextQuestion(index);
              togglePopover();
            }}
          >
            Input
          </Menu.Item>
          <Menu.Item
            name='choice'
            onClick={() => {
              addChoiceQuestion(index);
              togglePopover();
            }}
          >
            Choice
          </Menu.Item>
          <Menu.Item
            name='attachment'
            onClick={() => {
              addAttachmentQuestion(index);
              togglePopover();
            }}
          >
            Attachment
          </Menu.Item>
        </Menu>
      </Popup>
    )
}