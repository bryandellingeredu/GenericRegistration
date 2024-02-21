import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, Container, Divider, Header, HeaderContent, HeaderSubheader, Icon,
         Menu, Segment, SegmentGroup, Sidebar } from "semantic-ui-react";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import ArmyLogo from "../home/ArmyLogo";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

         interface Props {
            registrationEventId : string
            setNextActiveStep: () => void
            setPreviousActiveStep: () => void
            formIsDirty: boolean
            setFormDirty: () => void
            setFormClean: () => void
          }

export default observer ( function DesignPage(
  {registrationEventId, setNextActiveStep, setPreviousActiveStep, formIsDirty, setFormDirty, setFormClean } : Props) {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
    const [loading, setLoading] = useState(false);
    const [registrationEvent, setRegistrationEvent] = useState<RegistrationEvent>({
       id: '', title: '', overview: '', location: '', startDate: new Date(0), endDate: new Date(0) 
    })

    useEffect(() => {
        getRegistrationEvent();
      }, [registrationEventId]);

      const getRegistrationEvent = async () => {
        if(registrationEventId){
          setLoading(true);
          try{
              const data : RegistrationEvent = await agent.RegistrationEvents.details(registrationEventId);
              setRegistrationEvent(data);
             
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
      }
      if (loading) return <LoadingComponent content="Loading Data"/>
    return(
        <>
            {/* Inline style tag for demonstration. In production, move this to your CSS file. */}
            <style>
                {`
                    .customWideSidebar {
                        width: 90vw !important;
                        background-color: #f4f4f4 !important;
                    }
                `}
                
            </style>

       <div style={{padding: '40px'}} >

            <Sidebar.Pushable style={{height: '100vh'}}>
                <Sidebar
                    as={Container}
                    animation='overlay'
                    icon='labeled'
                    onHide={() => setSidebarVisible(false)}
                    vertical
                    visible={sidebarVisible}
                    className="customWideSidebar" // Apply custom class here
                >
                    <Menu inverted color='black' widths={3}>
      <Menu.Item>
    
      </Menu.Item>
      <Menu.Item>
      <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
      </Menu.Item>
      <Menu.Item>
        {/* Placeholder for right-aligned items if needed */}
      </Menu.Item>
    </Menu>

    {sidebarVisible && (
        <div style={{ padding : '40px' }}>
        <Editor
            editorState={editorState}
            readOnly={true}
            toolbarHidden={true}
            wrapperClassName="wrapper-class-preview"
            editorClassName="editor-class-preview"
            toolbarClassName="toolbar-class-hidden"
        />
        </div>
    )}

 
                </Sidebar>

                <Sidebar.Pusher dimmed={sidebarVisible}>
                    <SegmentGroup>
                    <Segment clearing style={{backgroundColor: '#f4f4f4'}}>
                    <Button basic color='orange' size='large' floated="right" onClick={toggleSidebar}
                    style={{marginRight: '40px'}}>
                <Icon name='eye' /> Preview Design
            </Button>
            </Segment>
                    <Segment clearing style={{backgroundColor: '#f4f4f4'}}>
                    <Header as='h2'>
    <Icon name='paint brush' />
    <HeaderContent>
      Design your registration page
      <HeaderSubheader>Use the editor to create your page. click the "Preview Design" button to view it</HeaderSubheader>
    </HeaderContent>
   
  </Header>
  </Segment>
   <Segment>
     <Editor 
                      editorState={editorState}
                      onEditorStateChange={setEditorState}
                      wrapperClassName="wrapper-class"
                      editorClassName="editor-class"
                      toolbarClassName="toolbar-class"
                    />

                    </Segment >
                    <Segment clearing style={{backgroundColor: '#f4f4f4'}}>
                    <Button type="button"
     size="huge" color="teal" floated="left"
     icon labelPosition='left'
      onClick={() => setPreviousActiveStep()}>
    Back To Questions
    <Icon name='arrow left' />
    </Button>
  <Button type="button"
     size="huge" color="teal" floated="right"
     icon labelPosition='right'
      onClick={() => setNextActiveStep()}>
    Go To Publish
    <Icon name='arrow right' />
    </Button>
                    </Segment>
                   </SegmentGroup>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
            </div>
        </>
    )
})