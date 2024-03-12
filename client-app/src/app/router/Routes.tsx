import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../feautures/home/HomePage";
import LoginUser from "../../feautures/home/LoginUser";
import MyRegistrations from "../../feautures/manageRegistration/myRegistrations";
import LoginError from "../../feautures/home/LoginError";
import ViewAllEvents from "../../feautures/registrants/viewAllEvents";
import RegisterForEvent from "../../feautures/registrants/registerForEvent";
import CreateUpdateRegistration from "../../feautures/createUpdateRegistration/createUpdateRegistration";
import SendEmailLink from "../../feautures/home/SendEmailLink";
import RegisterFromLink from "../../feautures/registrants/registerFromLink";


export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'login', element: <LoginUser /> },
            { path: 'myregistrations', element: <MyRegistrations /> },
            { path: 'loginerror', element: <LoginError /> },
            { path: 'newregistration', element: <CreateUpdateRegistration /> },
            { path: 'editregistration/:id', element: <CreateUpdateRegistration /> },
            { path: 'editregistration/:id/:step', element: <CreateUpdateRegistration /> },
            { path: 'viewallevents', element: <ViewAllEvents />},
            { path: 'registerforevent/:id', element: <RegisterForEvent /> },
            { path: 'sendemaillink/:id', element: <SendEmailLink /> },
            { path: 'registerfromlink', element: <RegisterFromLink /> },
        ]
    }
];

export const router = createBrowserRouter(routes, {basename: '/registration'});

