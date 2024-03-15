import { Answer } from "./answer"

export interface RegistrationWithHTMLContent{
    hcontent: string,
    id: string,
    registrationEventId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    registrationDate: Date
    answers? : Answer[]
    registered: boolean
}