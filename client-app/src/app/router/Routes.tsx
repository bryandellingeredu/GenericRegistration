import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../feautures/home/HomePage";
import LoginUser from "../../feautures/home/LoginUser";
import MyRegistrations from "../../feautures/manageRegistration/myRegistrations";
import LoginError from "../../feautures/home/LoginError";
import NewRegistration from "../../feautures/manageRegistration/newRegistration";


export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'login', element: <LoginUser /> },
            { path: 'myregistrations', element: <MyRegistrations /> },
            { path: 'loginerror', element: <LoginError /> },
            { path: 'newregistration', element: <NewRegistration /> },
        ]
    }
];

export const router = createBrowserRouter(routes, {basename: '/registration'});

