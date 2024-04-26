import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Divider, Form, FormField, Grid, Icon, Popup, Radio } from "semantic-ui-react";
import { useEffect, useState } from "react";

interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void
    setFormDirty: () => void
    saveFormInBackground: () => void
}

export default observer (function CreateUpdateRegistrationSettings(
    {registrationEvent, setRegistrationEvent, setFormDirty,  saveFormInBackground } : Props
){
  const [saveForm, setSaveForm] = useState(false);

  useEffect(() => {
    if (saveForm){
      saveFormInBackground();
      setSaveForm(false);
    }
  }, [saveForm]);

    const handleAutoApproveChange = () => {
        setRegistrationEvent({...registrationEvent, autoApprove :!registrationEvent.autoApprove})
        setFormDirty();
        setSaveForm(true);
      };

      const handleAutoEmailChange = () => {
        setRegistrationEvent({...registrationEvent, autoEmail :!registrationEvent.autoEmail})
        setFormDirty();
        setSaveForm(true);
      };

      const handleRegistrationIsOpenChange = () => {
        setRegistrationEvent({...registrationEvent, registrationIsOpen :!registrationEvent.registrationIsOpen})
        setFormDirty();
        setSaveForm(true);
      };

      const handlePublicChange = () => {
        setRegistrationEvent({...registrationEvent, public :!registrationEvent.public})
        setFormDirty();
        setSaveForm(true);
      };

      

    return (
      <Form style={{paddingBottom: '20px'}}>
      <Grid>
        <Grid.Row columns={3}>
          <Grid.Column width={8}>
            <Form.Field>
              <label>Auto Approve Registrants</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.autoApprove ? 'On' : 'Off'}
                checked={registrationEvent.autoApprove}
                onChange={handleAutoApproveChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="New registrants are automatically approved."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
        <Divider />
        <Grid.Row columns={3}>
          <Grid.Column width={8}>
            <Form.Field>
              <label>Event Privacy Status</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.public ? 'Public' : 'Private'}
                checked={registrationEvent.public}
                onChange={handlePublicChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="Public events will be displayed on the available events page."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
        <Divider/>
        <Grid.Row columns={3}>
          <Grid.Column width={8}>
            <Form.Field>
              <label>Send Email Notifications</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.autoEmail ? 'On' : 'Off'}
                checked={registrationEvent.autoEmail}
                onChange={handleAutoEmailChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="You will receive an email every time a user registers for your event."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
        <Divider/>
        <Grid.Row columns={3}>
          <Grid.Column width={8}>
            <Form.Field>
              <label>Registration Status</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.registrationIsOpen ? 'Open' : 'Closed'}
                checked={registrationEvent.registrationIsOpen }
                onChange={handleRegistrationIsOpenChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="Closing the registration will stop any new users from registering for your event."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
       
    )
})