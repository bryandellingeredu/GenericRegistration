import { Answer } from './answer';

export interface Registration {
  id: string;
  registrationEventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationDate: Date;
  answers?: Answer[];
  registered: boolean;
}

export class Registration implements Registration {
  id: string;
  registrationEventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationDate: Date;
  answers?: Answer[];
  registered: boolean;

  constructor(init?: Partial<Registration>) {
    this.id = '';
    this.registrationEventId = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.registrationDate = new Date();
    this.answers = undefined;
    this.registered = false;

    Object.assign(this, init);
  }
}

export class RegistrationFormValues extends Registration {
  constructor(init?: Partial<Registration>) {
    super(init);
  }
}
