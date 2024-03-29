import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { CardGroup, Container, Table, TableBody, TableCell, TableHeaderCell, TableRow } from "semantic-ui-react";
import AdministerRegistrantTableRow from "./administerRegistrantTableRow";
import AdministerRegistrantCard from "./administerRegistrantsCard";
import { useStore } from "../../app/stores/store";
import { Registration } from "../../app/models/registration";


interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    searchFilter: string
    showQuestions: boolean
    showTable: boolean
    queryOrder: string
}

export default observer(function AdministerRegistrantTable (
    {registrationEvent, setRegistrationEvent, deleteRegistration,
     changeRegistered, searchFilter, showQuestions, showTable, queryOrder} : Props
){
    const {responsiveStore } = useStore();
    const {isMobile} = responsiveStore;

    const sortRegistrations = (registrations: Registration[], queryOrder: string): Registration[] => {
      return registrations.sort((a, b) => {
        switch (queryOrder) {
          case 'registerDtAsc':
            return new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
          case 'registerDtDesc':
            return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
          case 'lastNameAsc':
            const nameA = a.lastName.toUpperCase();
            const nameB = b.lastName.toUpperCase();
            return nameA.localeCompare(nameB);
          case 'lastNameDesc':
            const nameADesc = a.lastName.toUpperCase();
            const nameBDesc = b.lastName.toUpperCase();
            return nameBDesc.localeCompare(nameADesc);
          default:
            // Handle default case or throw an error if unexpected value
            return 0;
        }
      });
    };

    const getFilteredAndSortedRegistrations = (registrations: Registration[], searchFilter: string, queryOrder: string): Registration[] => {
      const filtered = searchFilter
        ? registrations.filter(x =>
            x.firstName.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
            x.lastName.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
            x.email.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase())
          )
        : registrations;
    
      return sortRegistrations(filtered, queryOrder);
    };

    const filteredSortedRegistrations = getFilteredAndSortedRegistrations(registrationEvent.registrations!, searchFilter, queryOrder);


    return(
        <div style={{padding: '40px'}}>
        {showTable && 
        <Table celled structured color='teal'>
            <TableBody>
            {(filteredSortedRegistrations).map((registration) => (
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
                {(filteredSortedRegistrations).map((registration) => (
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