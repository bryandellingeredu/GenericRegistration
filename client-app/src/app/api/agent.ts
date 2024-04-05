import axios, { AxiosResponse } from 'axios';
import { Registration } from '../models/registration';
import { User } from '../models/user';
import { store } from '../stores/store';
import { RegistrationEvent } from '../models/registrationEvent';
import { RegistrationEventWebsite } from '../models/registrationEventWebsite';
import { CustomQuestion } from '../models/customQuestion';
import { EmailLinkDTO } from '../models/emailLinkDTO';
import { RegistrationLink } from '../models/registrationLink';
import { registrationDTO } from '../models/registrationDTO';
import { RegistrationWithHTMLContent } from '../models/registrationWithHTMLContent';
import { RegistrationEventOwner } from '../models/registrationEventOwner';
import { AnswerAttachment } from '../models/answerAttachment';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}


const RegistrationEvents ={
    list: () => requests.get<RegistrationEvent[]>('/registrationEvents'),
    details: (id: string) => requests.get<RegistrationEvent>(`/registrationEvents/${id}`),
    createUpdate : (registrationEvent: RegistrationEvent) => requests.post<void>('/registrationEvents', registrationEvent),
    delete: (id: string) => axios.delete<void>(`/registrationEvents/${id}`),
    publish: (id: string) => axios.put<void>(`/registrationEvents/publish/${id}`, {}),
    unpublish: (id: string) => axios.put<void>(`/registrationEvents/unpublish/${id}`, {}),

}

const RegistrationEventWebsites = {
    details: (registrationEventId: string) => requests.get<RegistrationEventWebsite>(`/RegistrationEventWebsites/${registrationEventId}`),
    createUpdate : (registrationEventWebsite: RegistrationEventWebsite) => requests.post<void>('/RegistrationEventWebsites', registrationEventWebsite)
}

const CustomQuestions = {
    details: (registrationEventId: string) => requests.get<CustomQuestion[]>(`/CustomQuestions/${registrationEventId}`),
    createUpdate : (registrationEventId: string, customQuestions: CustomQuestion[]) => requests.post<void>(`/CustomQuestions/${registrationEventId}`, customQuestions)
}

const Registrants = {
    list: () => requests.get<RegistrationEvent[]>('/Registrants'), 
}
const Account = {
    login: (token: string) => requests.post<User>('/account/login', {token}),
    current: () => requests.get<User>('/account')
}

const EmailLinks = {
    sendLink: (emailLink: EmailLinkDTO) => requests.post<void>('/EmailLink', emailLink),
    validate: (encryptedKey: string) => requests.post<void>('/EmailLink/validate', {encryptedKey}),
    delete: (encryptedKey: string) => requests.post<void>('/EmailLink/delete', {encryptedKey}),
    getRegistrationEvent: (encryptedKey: string) => requests.post<RegistrationEvent>('/EmailLink/getRegistrationEvent', {encryptedKey}),
    getRegistrationLink: (encryptedKey: string) => requests.post<RegistrationLink>('/EmailLink/getRegistrationLink', {encryptedKey}),
    getRegistration: (encryptedKey: string) => requests.post<Registration>('/EmailLink/getRegistration', {encryptedKey}),
    createUpdateRegistration: (data: registrationDTO) => requests.post<void>('/EmailLink/createUpdateRegistration', data),
    getAnswerAttachments: (encryptedKey: string) => requests.post<AnswerAttachment[]>('/EmailLink/getAnswerAttachments', {encryptedKey}),
    deleteAnswerAttachment: (encryptedKey: string, answerAttachmentId: string) => requests.post<void>(`/EmailLink/deleteAnswerAttachment/${answerAttachmentId}`, {encryptedKey}),
}

const Registrations = {
    getRegistration: (email: string, registrationEventId: string) => requests.post<Registration>('/Registration/getRegistration',{email, registrationEventId }),
    createUpdateRegistration: (data: RegistrationWithHTMLContent) => requests.post<void>('/Registration/createUpdateRegistration', data),
    delete: (id: string) => axios.delete<void>(`/Registration/${id}`),
    details: (id: string) => requests.get<Registration>(`/Registration/${id}`),
    changeRegistered: (id: string, registered: boolean) => requests.put<void>(`/Registration/changeRegistered/${id}`, {registered}),
    list: (id: string) => requests.post<Registration[]>(`/Registration/GetByRegistrationId/${id}`, {}),
}

const RegistrationEventOwners = {
    list: (registrationEventId: string) => requests.get<RegistrationEventOwner[]>(`/registrationEventOwners/${registrationEventId}`),
    createUpdate: (registrationEventId: string, registrationEventOwners: RegistrationEventOwner[]) => requests.post<void>(`/registrationEventOwners/${registrationEventId}`, registrationEventOwners)
}

const AnswerAttachments = {
    list: (registrationId : string) => requests.get<AnswerAttachment[]>(`/AnswerAttachments/${registrationId}`),
    listByEventRegistration: (eventRegistrationId: string)  => requests.get<AnswerAttachment[]>(`/AnswerAttachments/GetByRegistrationEvent/${eventRegistrationId}`),
    delete: (answerAttachmentId: string) => requests.del<void>(`/AnswerAttachments/${answerAttachmentId}`)
}

const Uploads = {
    uploadAnswerAttachment: (file: any, answerAttachmentId: string, customQuestionId: string, registrationId: string ) => {
        let formData = new FormData();
        formData.append('File', file);
        formData.append('answerAttachmentId', answerAttachmentId);
        formData.append('customQuestionId', customQuestionId);
        formData.append('registrationId', registrationId);
        return axios.post('upload/addAnswerAttachment', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
          })
    }
    
}

const agent = {
    Registrants,
    Account,
    RegistrationEvents,
    RegistrationEventWebsites,
    CustomQuestions,
    EmailLinks,
    Registrations,
    RegistrationEventOwners,
    AnswerAttachments,
    Uploads
}

export default agent;