import { Container } from "semantic-ui-react";
import ManageRegistrationNavbar from "../../app/layout/ManageRegistrationNavbar";

export default function MyRegistrations() {
    return(
        <>
        <ManageRegistrationNavbar  />
        <Container fluid>

            <h1>My Registrations</h1>
        </Container>
        </>
    )
}