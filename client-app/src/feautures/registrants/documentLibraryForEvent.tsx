import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Button, Container, Divider, Dropdown, Grid, Header, Icon, Menu, Message, MessageItem, MessageList } from "semantic-ui-react";
import ArmyLogo from "../home/ArmyLogo";
import { useStore } from "../../app/stores/store";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw  } from "draft-js";
import { RegistrationEventWebsite } from "../../app/models/registrationEventWebsite";
import Tree from "../documentLibrary/tree";
import { Node } from "../../app/models/Node";
import { reaction } from "mobx";

const apiUrl = import.meta.env.VITE_API_URL;

function formatDate(date : Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default observer (function DocumentLibraryForEvent() {

    const { userStore, responsiveStore,  documentLibraryStore } = useStore();

    const {isMobile} = responsiveStore
    const { user, logout } = userStore;
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(false);
    const [loadTreeData, setLoadTreeData] = useState(false);
    const [content, setContent] = useState('');
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [treeData, setTreeData] = useState<Node[]>([]);

    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(
        {
          id: '',
          title: '',
          location: '',
          startDate: new Date(),
          endDate: new Date(),
          overview: '',
          published: true,
          public: true,
          autoApprove: true,
          autoEmail: true,
          registrationIsOpen: true,
          maxRegistrantInd: false,
          maxRegistrantNumber: '',
          certified: true,
          documentLibrary: false
        }  
    );

    function displayDateRange(startDate : Date, endDate : Date) {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
      
        // Check if start and end dates are the same
        if (formattedStartDate === formattedEndDate) {
          return formattedStartDate;
        } else {
          return `${formattedStartDate} - ${formattedEndDate}`;
        }
      }

    useEffect(() => {
        if(id) getRegistrationEvent();     
      }, [id]);

      useEffect(() => {
        if(user && user.mail && registrationEvent && registrationEvent.id)
        {
          getDocumentLibraryData();
        } 
      }, [user, registrationEvent]);

      useEffect(() => {
        if(content){
          setEditorState(
            EditorState.createWithContent(
              convertFromRaw(
                JSON.parse(content)
              )
            )
          );
        }
      }, [content]);

      useEffect(() => {
        if (loadTreeData) {
            documentLibraryStore.fetchAndStoreTreeData(registrationEvent.id);
        }
    }, [loadTreeData, registrationEvent.id, documentLibraryStore]);

    useEffect(() => {
        const disposer = reaction(
            () => documentLibraryStore.TreeDataRegistry.get(registrationEvent.id),
            (data) => {
                if (data) {
                    setTreeData(data);
                }
            }
        );
    
        // Cleanup the reaction when the component unmounts
        return () => disposer();
    }, [registrationEvent.id, documentLibraryStore]);

      const getRegistrationEvent = async () => {
        setLoading(true)
        try{
            const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(id!);
            setRegistrationEvent(registrationEvent);
        } catch (error: any) {
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

      const getDocumentLibraryData = async () =>{
        setLoading2(true);
        try{
            const registrationEventWebsite : RegistrationEventWebsite | null = await agent.DocumentUploadWebsites.details(id!);
            if(registrationEventWebsite && registrationEventWebsite) setContent(registrationEventWebsite.content);
            setLoadTreeData(true);
        } catch (error: any) {
        console.log(error);
        if (error && error.message) {
          toast.error("An error occurred: " + error.message);
        } else {
          toast.error("An error occured loading data");
        }
      }finally {
        setLoading2(false);
    }
      }

    const handleSignIn = () =>{
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const url = `${baseUrl}?redirecttopage=documentlibraryforevent/${id}`
        window.location.href = url;
      }

      if (loading || loading2) return <LoadingComponent content="Loading Data..."/>
    return(
        <>
      
        <Menu inverted color='black'  widths='2'>
      <Menu.Item>
      <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
      </Menu.Item>
      
      {user && !isMobile &&
         <Menu.Item>
      <Dropdown trigger={
      <>
        <Icon name="user" />
         {user?.displayName}
         </>
      }>
                <Dropdown.Menu>
                  <Dropdown.Item icon="power" text="Logout" onClick={logout} />
                </Dropdown.Menu>
              </Dropdown>
      </Menu.Item>
      }

    </Menu>

    {!user &&
      <Container>
          <Message info>
          {!isMobile && 
          <Message.Header>
          <Divider horizontal>
  <Header as='h4'>
    <Icon name='folder open outline' />
    Document Library For {registrationEvent.title}
  </Header>
</Divider>
          </Message.Header>}
          <Message.Content>
            <h4>
               In order to view the document library for this event you will need to sign in
            </h4>
          </Message.Content>

          <MessageList>
            <MessageItem>You can sign in with an Edu Account</MessageItem>
            <MessageItem>You can sign in with a CAC</MessageItem>
            <MessageItem>You can sign in by having a confirmation link emailed to you</MessageItem>
        </MessageList>
  
          
        <Message.Content>
          <Button size="huge" primary content='Sign In' style={{marginTop: '40px'}} onClick={handleSignIn}/>
        </Message.Content>
   
        </Message>
        </Container>
    }
    {user && 
      <Grid  stackable style={{padding: '40px' }}>
        <Grid.Row>
        <Grid.Column width={8}>
        <Header as='h3'>
        <Icon name='book' />
         <Header.Content>
         {registrationEvent.title} Document Library
         </Header.Content>
        </Header>
        <Header as='h3'>
        <Icon name='map marker alternate' />
         <Header.Content>
         {registrationEvent.location}
         </Header.Content>
        </Header> 
        <Header as='h3'>
        <Icon name='calendar' />
         <Header.Content>
         {displayDateRange(registrationEvent.startDate, registrationEvent.endDate)}
         </Header.Content>
        </Header> 
        <Editor
            editorState={editorState}
            readOnly={true}
            toolbarHidden={true}
            wrapperClassName="wrapper-class-preview"
            editorClassName="editor-class-preview"
            toolbarClassName="toolbar-class-hidden"
        />
        </Grid.Column>
        <Grid.Column width={8}>
        <Tree treeData = {treeData} registrationEventId = {registrationEvent.id} isAdmin={false} />
        </Grid.Column>
        </Grid.Row>
      </Grid>
     }
        </>
    );
});