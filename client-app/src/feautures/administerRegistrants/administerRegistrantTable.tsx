import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { CardGroup, Container, Table, TableBody, TableCell, TableHeaderCell, TableRow } from "semantic-ui-react";
import AdministerRegistrantTableRow from "./administerRegistrantTableRow";
import AdministerRegistrantCard from "./administerRegistrantsCard";
import { useStore } from "../../app/stores/store";


interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    searchFilter: string
    showQuestions: boolean
    showTable: boolean
}

export default observer(function AdministerRegistrantTable (
    {registrationEvent, setRegistrationEvent, deleteRegistration,
     changeRegistered, searchFilter, showQuestions, showTable} : Props
){
    const {responsiveStore } = useStore();
    const {isMobile} = responsiveStore

    const filteredRegistrations = searchFilter ?
    registrationEvent.registrations!.filter(
        x =>
        x.firstName.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
        x.lastName.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
        x.email.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()) 
        )
     : registrationEvent.registrations;


    return(
        <div style={{padding: '40px'}}>
        {showTable && 
        <Table celled structured color='teal'>
            <TableBody>
            {filteredRegistrations!.sort((a, b) => {
  const nameA = a.lastName.toUpperCase(); // ignore upper and lowercase
  const nameB = b.lastName.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0; // names must be equal
}).map((registration) => (
               <AdministerRegistrantTableRow key={registration.id}
                registration={registration}
                questions={registrationEvent.customQuestions!}
                deleteRegistration={deleteRegistration}
                changeRegistered={changeRegistered}
                showQuestions={showQuestions}
                />       
            ))}
            </TableBody>
        </Table>
        }
        {!showTable && 
        <CardGroup itemsPerRow={isMobile ? '1' : '3'}>
                 {filteredRegistrations!.sort((a, b) => {
  const nameA = a.lastName.toUpperCase(); // ignore upper and lowercase
  const nameB = b.lastName.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0; // names must be equal
}).map((registration) => (
               <AdministerRegistrantCard key={registration.id}
                registration={registration}
                questions={registrationEvent.customQuestions!}
                deleteRegistration={deleteRegistration}
                changeRegistered={changeRegistered}
                showQuestions={showQuestions}
                />       
            ))}
        </CardGroup>
        }
        </div>
    )
})