import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Divider, Form, FormField, Grid, Icon, Input, Popup, Radio } from "semantic-ui-react";
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

      const handleDocumentLibraryChange = () => {
        setRegistrationEvent({...registrationEvent, documentLibrary :!registrationEvent.documentLibrary})
        setFormDirty();
        setSaveForm(true);
      }

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

      const handleMaxRegistrantsChange = () => {
        setRegistrationEvent({...registrationEvent, maxRegistrantInd :!registrationEvent.maxRegistrantInd})
        setFormDirty();
        setSaveForm(true);
      }

      const debounce = (func: (...args: any[]) => void, wait: number): (...args: any[]) => void => {
        let timeout: NodeJS.Timeout | null = null;
    
        return function executedFunction(...args: any[]): void {
            const later = () => {
                clearTimeout(timeout as NodeJS.Timeout);
                func(...args);
            };
    
            clearTimeout(timeout as NodeJS.Timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    const debouncedUpdate = debounce(() => {
        setFormDirty();
        setSaveForm(true);
    }, 500);
    
    const handleMaxRegistrantsNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const validNumericInput = /^[0-9]*$/;
        if (validNumericInput.test(value)) {
            setRegistrationEvent({ ...registrationEvent, maxRegistrantNumber: value });
            debouncedUpdate();  
        }
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
              <label>Class Size is Limited</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.maxRegistrantInd ? 'Yes' : 'No'}
                checked={registrationEvent.maxRegistrantInd }
                onChange={handleMaxRegistrantsChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="Registration will close after approved users exceed class size."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
        {registrationEvent.maxRegistrantInd &&
        <Grid.Row>
           <Grid.Column width={8}>
            <Form.Field>
              <label>Enter Maximum Number of Registrants</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Input
              placeholder="0"
              value={registrationEvent.maxRegistrantNumber}
              onChange={handleMaxRegistrantsNumberChange}
               />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="Registration will close after approved users exceed class size."
              trigger={<Button color='teal' basic icon='question' />}
              on='click'
              position="top right"
            />
          </Grid.Column>
        </Grid.Row>
          
        }  
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
        <Divider/>
        <Grid.Row columns={3}>
          <Grid.Column width={8}>
            <Form.Field>
              <label>Create Document Library</label>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={5}>
            <Form.Field>
              <Radio
                toggle
                label={registrationEvent.documentLibrary ? 'On' : 'Off'}
                checked={registrationEvent.documentLibrary}
                onChange={handleDocumentLibraryChange}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column width={3}>
            <Popup
              content="Create a Document Library where you can upload files that registrants can access for your event."
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