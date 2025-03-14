import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import HomePage from '../../feautures/home/HomePage';
import LoginUser from '../../feautures/home/LoginUser';
import MyRegistrations from '../../feautures/manageRegistration/myRegistrations';
import LoginError from '../../feautures/home/LoginError';
import ViewAllEvents from '../../feautures/registrants/viewAllEvents';
import RegisterForEvent from '../../feautures/registrants/registerForEvent';
import CreateUpdateRegistration from '../../feautures/createUpdateRegistration/createUpdateRegistration';
import SendEmailLink from '../../feautures/home/SendEmailLink';
import RegisterFromLink from '../../feautures/registrants/registerFromLink';
import ThankYouForRegistering from '../../feautures/registrants/thankYouForRegistering';
import ThankYouForRegisteringFromLink from '../../feautures/registrants/thankYouForRegisteringFromLink';
import DeRegisterForEvent from '../../feautures/registrants/deRegisterForEvent';
import DeRegisterForEventFromLink from '../../feautures/registrants/deRegisterForEventFromLink';
import AdministerRegistrants from '../../feautures/administerRegistrants/administerRegistrants';
import DocumentLibraryForEvent from '../../feautures/registrants/documentLibraryForEvent';
import RegisterForDocumentLibraryFromLink from '../../feautures/registrants/registerForDocumentLibraryFromLink';
import DocumentLibraryFromLink from '../../feautures/registrants/documentLibraryFromLink';
import SendEmailLinkForDocumentLibrary from '../../feautures/home/SendEmailLinkForDocumentLibrary';
import ManageAdmins from '../../feautures/admins/manageAdmins';

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
      {
        path: 'editregistration/:id/:step',
        element: <CreateUpdateRegistration />,
      },
      { path: 'viewallevents', element: <ViewAllEvents /> },
      { path: 'registerforevent/:id', element: <RegisterForEvent /> },
      {
        path: 'documentlibraryforevent/:id',
        element: <DocumentLibraryForEvent />,
      },
      { path: 'sendemaillink/:id', element: <SendEmailLink /> },
      {
        path: 'sendemaillinkfordocumentlibrary/:id',
        element: <SendEmailLinkForDocumentLibrary />,
      },
      { path: 'registerfromlink', element: <RegisterFromLink /> },
      { path: 'documentlibraryfromlink', element: <DocumentLibraryFromLink /> },
      {
        path: 'thankyouforregistering/:id',
        element: <ThankYouForRegistering />,
      },
      {
        path: 'thankyouforregisteringfromlink/:encryptedKey',
        element: <ThankYouForRegisteringFromLink />,
      },
      { path: 'deregisterforevent/:id', element: <DeRegisterForEvent /> },
      {
        path: 'deregisterforeventfromlink/:encryptedKey',
        element: <DeRegisterForEventFromLink />,
      },
      { path: 'administerregistrants/:id', element: <AdministerRegistrants /> },
      { path: 'manageAdmins', element: <ManageAdmins /> },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  basename: '/registration',
});
