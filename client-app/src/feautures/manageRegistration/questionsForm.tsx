import { observer } from "mobx-react-lite";
import { Button, Divider, Header, Icon, Message } from "semantic-ui-react";

interface Props {
  registrationEventId : string
  setNextActiveStep: () => void
  setPreviousActiveStep: () => void
  formIsDirty: boolean
  setFormDirty: () => void
  setFormClean: () => void
}

export default observer ( function QuestionsForm(
  {registrationEventId, setNextActiveStep, setPreviousActiveStep,
    formIsDirty, setFormDirty, setFormClean } : Props
) {

    return(
      <>
        <Divider horizontal>
    <Header as='h2'>
      <Icon name='question' />
      Questions
    </Header>
  </Divider>
  <div style={{padding: '40px'}}>
  <Message info>
                <Message.Header>Registration Requirements</Message.Header>
                <p>All registration forms include 4 standard required questions:</p>
                <ul>
                    <li>First Name</li>
                    <li>Last Name</li>
                    <li>Email</li>
                    <li>Phone</li>
                </ul>
                <p>In addition to these standard questions, you have the flexibility to add custom questions to your registration form. These can be:</p>
                <ul>
                    <li><strong>Text-Type Questions:</strong> For open-ended responses where registrants can type their answers.</li>
                    <li><strong>Choice-Type Questions:</strong> Where registrants select from provided options.</li>
                </ul>
                <p>This feature allows you to tailor the registration process to better suit the needs of your event or activity, ensuring you gather all necessary information from participants.</p>
  </Message>
  <Button type="button"
     size="huge" color="teal" floated="left"
     icon labelPosition='left'
      onClick={() => setPreviousActiveStep()}>
    Back To Details
    <Icon name='arrow left' />
    </Button>
  <Button type="button"
     size="huge" color="teal" floated="right"
     icon labelPosition='right'
      onClick={() => setNextActiveStep()}>
    Go To Design
    <Icon name='arrow right' />
    </Button>
    </div>
</>
    )
})