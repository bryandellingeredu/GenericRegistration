import axios, { AxiosResponse } from 'axios';
import { Registration } from '../models/registration';
import { User } from '../models/user';
import { store } from '../stores/store';
import { RegistrationEvent } from '../models/registrationEvent';
import { RegistrationEventWebsite } from '../models/registrationEventWebsite';

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

const Registrations = {
    list: () => requests.get<Registration[]>('/registrations'),
    details: (id: string) => requests.get<Registration>(`/registrations/${id}`),
    create: (registration: Registration) => requests.post<void>('/registrations', registration),
    update: (registration: Registration) => requests.put<void>(`/registrations/${registration.id}`, registration),
    delete: (id: string) => axios.delete<void>(`/registrations/${id}`),
}

const RegistrationEvents ={
    list: () => requests.get<RegistrationEvent[]>('/registrationEvents'),
    details: (id: string) => requests.get<RegistrationEvent>(`/registrationEvents/${id}`),
    createUpdate : (registrationEvent: RegistrationEvent) => requests.post<void>('/registrationEvents', registrationEvent)
}

const RegistrationEventWebsites = {
    details: (registrationEventId: string) => requests.get<RegistrationEventWebsite>(`/RegistrationEventWebsites/${registrationEventId}`),
    createUpdate : (registrationEventWebsite: RegistrationEventWebsite) => requests.post<void>('/RegistrationEventWebsites', registrationEventWebsite)
}

const Registrants = {
    list: () => requests.get<RegistrationEvent[]>('/Registrants'), 
}
const Account = {
    login: (token: string) => requests.post<User>('/account/login', {token}),
    current: () => requests.get<User>('/account')

}

const agent = {
    Registrations,
    Registrants,
    Account,
    RegistrationEvents,
    RegistrationEventWebsites
}

export default agent;