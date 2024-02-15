import { observer } from "mobx-react-lite";
import { Divider, Header, Icon } from "semantic-ui-react";

export default observer ( function QuestionsForm() {

    return(
        <Divider horizontal>
    <Header as='h4'>
      <Icon name='question' />
      Questions
    </Header>
  </Divider>
    )
})