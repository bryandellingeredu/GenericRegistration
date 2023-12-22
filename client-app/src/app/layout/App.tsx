
import { Outlet, ScrollRestoration } from "react-router-dom"
import { Container } from "semantic-ui-react"
import { useStore } from "../stores/store"
import { useEffect } from "react";
import LoadingComponent from "./LoadingComponent";
import { observer } from "mobx-react-lite";
import ModalContainer from "../common/modals/ModalContainer";

function App() {

const {} = useStore();
const {commonStore, userStore} = useStore();

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
   <Container fluid >
      <Outlet />
   </Container>
   </>
  )
}

export default observer(App);
