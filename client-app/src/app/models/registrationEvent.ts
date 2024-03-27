import { CustomQuestion } from "./customQuestion";
import { Registration } from "./registration";

export interface RegistrationEvent{
    id: string
    title: string
    location: string
    overview: string
    startDate: Date
    endDate: Date
    published: boolean,
    public: boolean
    autoApprove: boolean
    certified: boolean
    registrations?: Registration[]
    customQuestions?: CustomQuestion[]
}