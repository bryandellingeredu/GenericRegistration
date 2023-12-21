import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../feautures/home/HomePage";
import CreateRegistration from "../../feautures/createRegistration/createRegistration";
import LoginUser from "../../feautures/home/LoginUser";


export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'login', element: <LoginUser /> },
            { path: 'createRegistrationForm', element: <CreateRegistration /> },
        ]
    }
];

export const router = createBrowserRouter(routes, {basename: '/registration'});

