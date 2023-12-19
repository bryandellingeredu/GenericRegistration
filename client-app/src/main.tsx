import React from 'react'
import ReactDOM from 'react-dom/client'
import 'semantic-ui-css/semantic.min.css'
import './app/layout/styles.css'
import { StoreContext, store } from './app/stores/store'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/Routes'
import { Providers, Msal2Provider } from '@microsoft/mgt';

Providers.globalProvider = new Msal2Provider({
  clientId: import.meta.env.VITE_CLIENT_ID!,
  authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  scopes: [ 'user.read']
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreContext.Provider value={store}>
    <RouterProvider router={router}/>
    </StoreContext.Provider>
  </React.StrictMode>,
)
