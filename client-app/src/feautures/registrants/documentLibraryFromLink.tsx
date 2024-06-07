import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../../app/stores/store";
import { useNavigate } from "react-router-dom";
import { RegistrationEvent, RegistrationEventFormValues } from "../../app/models/registrationEvent";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Grid, Header, Icon, Menu, Message } from "semantic-ui-react";
import agent from "../../app/api/agent";
import ArmyLogo from "../home/ArmyLogo";
import { RegistrationLink } from "../../app/models/registrationLink";
import { RegistrationEventWebsite } from "../../app/models/registrationEventWebsite";
import { EditorState, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Node } from "../../app/models/Node";
import { reaction } from "mobx";
import Tree from "../documentLibrary/tree";


const apiUrl = import.meta.env.VITE_API_URL;

const query = new URLSearchParams(location.search);

function formatDate(date : Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default observer(function RegisterForDocumentLibraryFromLink() {

    const { userStore, responsiveStore,  documentLibraryStore } = useStore();
    const {isMobile} = responsiveStore
    const navigate = useNavigate();
    const encryptedKey = query.get('key');
    const [validating, setValidating] = useState(true);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [loadTreeData, setLoadTreeData] = useState(false);
    const [treeData, setTreeData] = useState<Node[]>([]);
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>(new RegistrationEventFormValues());
   

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
        getData();
        }, [encryptedKey])
    
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
            if (loadTreeData && encryptedKey) {
                documentLibraryStore.fetchAndStoreTreeData(registrationEvent.id);
            }
        }, [loadTreeData, registrationEvent.id, documentLibraryStore, encryptedKey]);
    
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
    
        const getData = async() => {
            if (!encryptedKey) return;
            const decodedKey = decodeURIComponent(encryptedKey);
            try{
                setValidating(true);
                await agent.EmailLinks.validate(decodedKey);
                setValidating(false);
                setValidated(true);
                setLoading(true);
                const registrationEvent : RegistrationEvent = await agent.EmailLinks.getRegistrationEvent(decodedKey);
                setRegistrationEvent(registrationEvent)
                const registrationLink : RegistrationLink = await agent.EmailLinks.getRegistrationLink(decodedKey);
                setEmail(registrationLink.email);
                const registrationEventWebsite : RegistrationEventWebsite | null = await agent.DocumentUploadWebsites.details(registrationEvent.id);
                if(registrationEventWebsite && registrationEventWebsite) setContent(registrationEventWebsite.content);
                setLoadTreeData(true);

            }catch (error: any) {
            console.log(error);
            if (error && error.message) {
              toast.error("An error occurred: " + error.message);
            } else {
              toast.error("invalid email link");
            }
          } finally {
            setValidating(false);
            setLoading(false);
          }
        }

        if (validating) return <LoadingComponent content="Validating Email Link..."/>
        if (loading) return <LoadingComponent content="Loading Data..."/>

    return(
        <>
         {!validated &&
           <Message negative
           icon='exclamation mark'
           header='Not Authorized'
           content='This is an invalid document library link.'
         />
        }
          {validated &&
                 <>
                  <Menu inverted color='black'  widths='2'>
                  <Menu.Item>
                    <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
                </Menu.Item>
                {!isMobile && 
                <Menu.Item>
                  <Header as='h4' inverted>
                    <Icon name='user' color='teal'/>
                      <Header.Content>
                        {email}
                      </Header.Content>
                  </Header> 
                </Menu.Item>
               }
              </Menu>
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
                {encryptedKey &&
                <Tree treeData = {treeData} registrationEventId = {registrationEvent.id} isAdmin={false} encryptedKey={encryptedKey} />
                 }
                </Grid.Column>
                </Grid.Row>
           </Grid>
           </>
          }
        </>
       );
});