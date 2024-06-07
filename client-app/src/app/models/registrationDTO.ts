import { Answer } from './answer';
import { Registration } from './registration';

export interface registrationDTO {
  hcontent: string;
  decodedKey: string;
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
