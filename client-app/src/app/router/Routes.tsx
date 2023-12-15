import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../feautures/home/HomePage";
import CreateRegistration from "../../feautures/createRegistration/createRegistration";


export const routes: RouteObject[] = [
    {
        path: 'registration/',
        element: <App />,
        children: [
            { path: '', element: <HomePage /> },
            { path: 'createRegistrationForm', element: <CreateRegistration /> }
        ]
    }
];

export const router = createBrowserRouter(routes);

