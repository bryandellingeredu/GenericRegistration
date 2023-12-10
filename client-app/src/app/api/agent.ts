import axios, { AxiosResponse } from 'axios';
import { Registration } from '../models/registration';

axios.defaults.baseURL = 'http://localhost:5000/api';

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

const agent = {
    Registrations
}

export default agent;