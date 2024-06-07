import { FormField, Input } from 'semantic-ui-react';
import { Registration } from '../../app/models/registration';

interface Props {
  formisDirty: boolean;
  registrationIsOpen: () => boolean;
  registration: Registration;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emailUpdateAllowed: boolean;
}

export default function CommonFormQuestions({
  formisDirty,
  registrationIsOpen,
  registration,
  handleInputChange,
  emailUpdateAllowed,
}: Props) {
  const isValidEmail = (email: string) => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return emailRegex.test(email);
  };

  return (
    <>
      <FormField
        required
        error={
          formisDirty &&
          (!registration.firstName || !registration.firstName.trim())
        }
        disabled={!registrationIsOpen() && !registration.registered}
      >
        <label>First Name</label>
        <Input
          value={registration.firstName}
          name="firstName"
          onChange={handleInputChange}
        />
      </FormField>
      <FormField
        required
        error={
          formisDirty &&
          (!registration.lastName || !registration.lastName.trim())
        }
        disabled={!registrationIsOpen() && !registration.registered}
      >
        <label>Last Name</label>
        <Input
          value={registration.lastName}
          name="lastName"
          onChange={handleInputChange}
        />
      </FormField>
      <FormField
        required
        error={
          formisDirty &&
          (!registration.email ||
            !registration.email.trim() ||
            !isValidEmail(registration.email))
        }
        disabled={!registrationIsOpen() && !registration.registered}
      >
        <label>Email</label>
        {emailUpdateAllowed && (
          <Input
            value={registration.email}
            name="email"
            onChange={handleInputChange}
          />
        )}
        {!emailUpdateAllowed && (
          <Input value={registration.email} name="email" />
        )}
      </FormField>
    </>
  );
}
