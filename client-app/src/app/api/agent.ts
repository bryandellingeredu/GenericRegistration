import axios, { AxiosResponse } from 'axios';
import { Registration } from '../models/registration';
import { User } from '../models/user';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}

const Registrations = {
    list: () => requests.get<Registration[]>('/registrations'),
    details: (id: string) => requests.get<Registration>(`/registrations/${id}`),
    create: (registration: Registration) => axios.post<void>('/registrations', registration),
    update: (registration: Registration) => axios.put<void>(`/registrations/${registration.id}`, registration),
    delete: (id: string) => axios.delete<void>(`/registrations/${id}`),
}

const Account = {
    login: (token: string) => requests.post<User>('/account/login', {token}),
    current: () => requests.get<User>('/account')

}

const agent = {
    Registrations,
    Account
}

export default agent;