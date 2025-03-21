import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  Input,
  Label,
  Message,
  Segment,
  SegmentGroup,
} from 'semantic-ui-react';
import { RegistrationEventOwner } from '../../app/models/registrationEventOwner';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  registrationEventOwners: RegistrationEventOwner[];
  setRegistrationEventOwners: (
    newRegistrationEventOwners: RegistrationEventOwner[],
  ) => void;
  registrationEventId: string;
  setFormDirty: () => void;
  saveFormInBackground: () => void;
  userEmails: string[];
}

export default observer(function CreateUpdateRegistrationOwners({
  registrationEventOwners,
  setRegistrationEventOwners,
  registrationEventId,
  setFormDirty,
  saveFormInBackground,
  userEmails,
}: Props) {
  const [saveForm, setSaveForm] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerEmailError, setNewOwnerEmailError] = useState(false);

  const handleNewOwnerEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewOwnerEmailError(false);
    const emailInput = e.target.value;
    if (userEmails.includes(emailInput)) {
      const newRegistrationEventOwner: RegistrationEventOwner = {
        id: uuidv4(),
        registrationEventId,
        email: emailInput,
      };
      setRegistrationEventOwners([
        ...registrationEventOwners,
        newRegistrationEventOwner,
      ]);
      setNewOwnerEmail('');
      setSaveForm(true);
      setFormDirty();
    } else {
      const error = validateEmail(emailInput);
      if (error) {
        setNewOwnerEmail(emailInput);
      } else {
        const newRegistrationEventOwner: RegistrationEventOwner = {
          id: uuidv4(),
          registrationEventId,
          email: emailInput,
        };
        setRegistrationEventOwners([
          ...registrationEventOwners,
          newRegistrationEventOwner,
        ]);
        setNewOwnerEmail('');
        setSaveForm(true);
        setFormDirty();
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      !email ||
      !emailRegex.test(email) ||
      !(email.endsWith('.mil') || email.endsWith('armywarcollege.edu'))
    );
  };

  const handleSubmit = () => {
    if (!newOwnerEmail) return;
    const error = validateEmail(newOwnerEmail);
    setNewOwnerEmailError(error);
    if (!error) {
      const newRegistrationEventOwner: RegistrationEventOwner = {
        id: uuidv4(),
        registrationEventId,
        email: newOwnerEmail,
      };
      setRegistrationEventOwners([
        ...registrationEventOwners,
        newRegistrationEventOwner,
      ]);
      setNewOwnerEmail('');
      setSaveForm(true);
      setFormDirty();
    }
  };

  useEffect(() => {
    if (saveForm) {
      saveFormInBackground();
      setSaveForm(false);
    }
  }, [saveForm]);

  const handleDeleteButton = (id: string) => {
    setRegistrationEventOwners(
      registrationEventOwners.filter((owner) => owner.id !== id),
    );
    setFormDirty();
    setSaveForm(true);
  };

  return (
    <SegmentGroup>
      <Segment textAlign="center" color="teal">
        <Header icon color="teal" as="h4">
          <Icon name="user" />
          Additional Event Administrators
        </Header>
      </Segment>
      {(!registrationEventOwners || registrationEventOwners.length < 1) && (
        <Segment>
          <Message warning>
            <Message.Header>
              There are no additional event administrators
            </Message.Header>
            <p>Would you like to add an additional event administrator? </p>
          </Message>
        </Segment>
      )}
      {registrationEventOwners && registrationEventOwners.length > 0 && (
        <Segment>
          {' '}
          {registrationEventOwners.map((owner) => (
            <Button
              key={owner.id}
              icon
              labelPosition="left"
              basic
              color="teal"
              size="large"
              onClick={() => handleDeleteButton(owner.id)}
            >
              <Icon name="x" color="red" />
              {owner.email}
            </Button>
          ))}
        </Segment>
      )}
      <Segment>
        <Header icon color="teal" textAlign="center" as="h4">
          <Icon name="plus" />
          Add a New Event Administrator
        </Header>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <FormField required width={16} error={newOwnerEmailError}>
              <Input
                id="emailInput"
                icon="envelope"
                iconPosition="left"
                placeholder="Edu or Mil Email Address"
                value={newOwnerEmail}
                name="newOwnerEmail"
                onChange={handleNewOwnerEmailChange}
                onBlur={handleSubmit}
                list="emailOptions"
              />
              <datalist id="emailOptions">
                {userEmails.map((email, index) => (
                  <option key={index} value={email} />
                ))}
              </datalist>
              {newOwnerEmailError && (
                <Label basic color="red" pointing>
                  Please enter a valid .mil or armywarcollege.edu email address
                </Label>
              )}
            </FormField>
          </FormGroup>
        </Form>
      </Segment>
    </SegmentGroup>
  );
});
