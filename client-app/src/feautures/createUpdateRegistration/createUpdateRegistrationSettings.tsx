import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Divider, Form, FormField, Grid, Icon, Popup, Radio } from "semantic-ui-react";
import { useState } from "react";

interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void
    setFormDirty: () => void
}

export default observer (function CreateUpdateRegistrationSettings(
    {registrationEvent, setRegistrationEvent, setFormDirty} : Props
){

    const handleAutoApproveChange = () => {
        setRegistrationEvent({...registrationEvent, autoApprove :!registrationEvent.autoApprove})
        setFormDirty();
      };

      const handlePublicChange = () => {
        setRegistrationEvent({...registrationEvent, public :!registrationEvent.public})
        setFormDirty();
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
      </Grid>
    </Form>
       
    )
})