import { CustomQuestion } from "./customQuestion";
import { Registration } from "./registration";

export interface RegistrationEvent {
    id: string;
    title: string;
    location: string;
    overview: string;
    startDate: Date;
    endDate: Date;
    published: boolean;
    public: boolean;
    autoApprove: boolean;
    autoEmail: boolean;
    documentLibrary: boolean;
    certified: boolean;
    registrationIsOpen: boolean;
    maxRegistrantInd: boolean;
    maxRegistrantNumber: string;
    registrations?: Registration[];
    customQuestions?: CustomQuestion[];
}

export class RegistrationEvent implements RegistrationEvent {
    id: string;
    title: string;
    location: string;
    overview: string;
    startDate: Date;
    endDate: Date;
    published: boolean;
    public: boolean;
    autoApprove: boolean;
    autoEmail: boolean;
    documentLibrary: boolean;
    certified: boolean;
    registrationIsOpen: boolean;
    maxRegistrantInd: boolean;
    maxRegistrantNumber: string;
    registrations?: Registration[];
    customQuestions?: CustomQuestion[];

    constructor(init?: Partial<RegistrationEvent>) {
        this.id = '';
        this.title = '';
        this.location = '';
        this.overview = '';
        this.startDate = new Date();
        this.endDate = new Date();
        this.published = false;
        this.public = true;
        this.autoApprove = true;
        this.autoEmail = true;
        this.documentLibrary = false;
        this.certified = false;
        this.registrationIsOpen = true;
        this.maxRegistrantInd = false;
        this.maxRegistrantNumber = '';
        this.registrations = undefined;
        this.customQuestions = undefined;

        Object.assign(this, init);
    }
}

export class RegistrationEventFormValues extends RegistrationEvent {
    constructor(init?: Partial<RegistrationEvent>) {
        super(init);
    }
}