import { CustomQuestion } from "./customQuestion";
import { Registration } from "./registration";

export interface RegistrationEvent{
    id: string
    title: string
    location: string
    overview: string
    startDate: Date
    endDate: Date
    published: boolean
    public: boolean
    autoApprove: boolean
    autoEmail: boolean
    documentLibrary: boolean
    certified: boolean
    registrationIsOpen: boolean
    registrations?: Registration[]
    customQuestions?: CustomQuestion[]
}