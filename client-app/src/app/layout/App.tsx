import { Outlet, ScrollRestoration } from "react-router-dom"
import { Container } from "semantic-ui-react"

function App() {


  return (
    <>
    <ScrollRestoration />
   <Container fluid >
      <Outlet />
   </Container>
   </>
  )
}

export default App
