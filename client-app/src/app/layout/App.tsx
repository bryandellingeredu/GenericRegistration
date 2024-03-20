
import { Outlet, ScrollRestoration } from "react-router-dom"
import { useStore } from "../stores/store"
import { useEffect } from "react";
import LoadingComponent from "./LoadingComponent";
import { observer } from "mobx-react-lite";
import ModalContainer from "../common/modals/ModalContainer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

const {} = useStore();
const {commonStore, userStore} = useStore();
const query = new URLSearchParams(location.search);

useEffect(() => {
  const redirecttopage = query.get('redirecttopage');
  const loginType = query.get('logintype')
  if(redirecttopage) commonStore.setRedirectToPage(redirecttopage)
  if(loginType) commonStore.setLoginType(loginType);
  }, [commonStore])

useEffect(() => {
  if (commonStore.token){
    userStore.getUser().finally(() => commonStore.setAppLoaded())
  } else {
    commonStore.setAppLoaded()
  }
}, [commonStore, userStore]);

if (!commonStore.appLoaded) return <LoadingComponent content="Loading app..."/>
  return (
    <>
    <ScrollRestoration />
    <ModalContainer />
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Outlet />

   </>
  )
}

export default observer(App);
