import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { RegistrationEvent } from '../../app/models/registrationEvent';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useNavigate, useParams } from "react-router-dom";
import ManageRegistrationNavbar from '../../app/layout/ManageRegistrationNavbar';
import { Container, Header, Icon, Message } from 'semantic-ui-react';
import AdministerRegistrantTable from './administerRegistrantTable';
import AdministerRegistrantsFilter from './administerRegistrantsFilter';
import { AnswerAttachment } from '../../app/models/answerAttachment';

export default observer(function AdministerRegistrants() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const LOCAL_STORAGE_KEY_SHOW_QUESTIONS = 'showQuestions';

  const [showQuestions, setShowQuestions] = useState(() => {
    const storedShowQuestions = localStorage.getItem(LOCAL_STORAGE_KEY_SHOW_QUESTIONS);
    return storedShowQuestions !== null ? JSON.parse(storedShowQuestions) : false;
  });
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHOW_QUESTIONS, JSON.stringify(showQuestions));
  }, [showQuestions]);

  const LOCAL_STORAGE_KEY_QUERY_ORDER = 'queryOrder';
  const [queryOrder, setQueryOrder] = useState(() => {
    const storedQueryOrder = localStorage.getItem(LOCAL_STORAGE_KEY_QUERY_ORDER);
    return storedQueryOrder !== null ? JSON.parse(storedQueryOrder) : 'registerDtAsc';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_QUERY_ORDER, JSON.stringify(queryOrder));
  }, [queryOrder]);

  const LOCAL_STORAGE_KEY_SHOW_TABLE = 'showTable';
  const [showTable, setShowTable] = useState(() => {
    const storedShowTable = localStorage.getItem(LOCAL_STORAGE_KEY_SHOW_TABLE);
    return storedShowTable !== null ? JSON.parse(storedShowTable) : false;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHOW_TABLE, JSON.stringify(showTable));
  }, [showTable]);

  const handleSetShowQuestions = (newShowQuestions : boolean) => setShowQuestions(newShowQuestions);
  const handleSetShowTable = (newShowTable : boolean) => setShowTable(newShowTable);
  const handleSetQueryOrder = (newQueryOrder : string) => setQueryOrder(newQueryOrder);
  const handleSetSearchFilter = (newSearchFilter : string) => setSearchFilter(newSearchFilter);
  const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
    {
      id: '',
      title: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      overview: '',
      published: false,
      autoApprove: true,
      public: true,
      registrations: [],
      certified: true,
      autoEmail: true,
      registrationIsOpen: true,
      documentLibrary: false
    }  
);

const [answerAttachments, setAnswerAttachments] = useState<AnswerAttachment[]>([]);

  useEffect(() => {
    if(id) getRegistrationEvent();     
  }, [id]);

  const handleSetRegistrationEvent = (event: RegistrationEvent) =>{
    setRegistrationEvent(event);
}
   const handleDeleteRegistration = async (id: string) => {
    try{
      if (registrationEvent.registrations){
        const registrations = registrationEvent.registrations.filter(x => x.id !== id);
        setRegistrationEvent({...registrationEvent, registrations})
        await agent.Registrations.delete(id);
       }
      }catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("An error occured deleting registration");
        }
      }
    }

    const handleChangeRegistered = async (id: string, registered: boolean) =>{

      try {
        if (registrationEvent.registrations) {
          const updatedRegistrations = registrationEvent.registrations.map((r) => {
            if (r.id === id) {
              return { ...r, registered: registered };
            }
            return r;
          });
          setRegistrationEvent({ ...registrationEvent, registrations: updatedRegistrations });
          await agent.Registrations.changeRegistered(id, registered);
        }
      }catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("An error occured changing registered");
        }
      }
    }

   

  const getRegistrationEvent = async () => {
    setLoading(true);
    try{
      const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
      setRegistrationEvent(registrationEvent);
      const answerAttachmentData : AnswerAttachment[] = await agent.AnswerAttachments.listByEventRegistration(id!)
      setAnswerAttachments(answerAttachmentData);
      }catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("An error occured loading data");
            }
          }finally {
            setLoading(false);
        }
  }

  if (loading) return <LoadingComponent content="Loading Data..."/>
    return(
        <>
          <ManageRegistrationNavbar />
          <Container fluid style={{ color: '#333', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
                        <Header as='h1' icon style={{ display: 'inline-block', margin: '0 auto', color: '#0d47a1' }}> {/* Dark blue text */}
                            <Icon name='users' color='teal' /> 
                            Manage Registrants
                            <Header.Subheader style={{ color: '#666' }}> 
                                <h3>Manage users that have registered for {registrationEvent.title}</h3>
                            </Header.Subheader>
                        </Header>
                    </div>
             </div>
             {(!registrationEvent || !registrationEvent.registrations || registrationEvent.registrations.length < 1)
              &&
              <Message error content='No users have registered for this event'  />
             }
             {registrationEvent && registrationEvent.registrations && registrationEvent.registrations.length > 0 &&
               <AdministerRegistrantsFilter 
               searchFilter={searchFilter}
               setSearchFilter={handleSetSearchFilter}
               showQuestions={showQuestions}
               setShowQuestions={handleSetShowQuestions}
               showTable={showTable}
               setShowTable={handleSetShowTable}
               registrationEventId={id!}
               queryOrder={queryOrder}
               setQueryOrder={handleSetQueryOrder}
               />
             }
             {registrationEvent && registrationEvent.registrations && registrationEvent.registrations.length > 0 &&
             <AdministerRegistrantTable
               registrationEvent={registrationEvent}
               answerAttachments={answerAttachments}
               setRegistrationEvent={handleSetRegistrationEvent}
               deleteRegistration={handleDeleteRegistration}
               changeRegistered={handleChangeRegistered}
               searchFilter={searchFilter}
               showQuestions={showQuestions}
               showTable={showTable}
               queryOrder={queryOrder}
              />
             }
          </Container>
        </>
    )
});