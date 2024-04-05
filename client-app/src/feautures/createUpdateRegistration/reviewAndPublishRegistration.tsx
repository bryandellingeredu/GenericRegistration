import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { RegistrationEvent } from '../../app/models/registrationEvent';
import { CustomQuestion } from '../../app/models/customQuestion';
import { Button, ButtonGroup, Divider, Form, FormField, Grid, Header, Icon, Input, Menu, Message, Select } from 'semantic-ui-react';
import ArmyLogo from '../home/ArmyLogo';
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { QuestionType } from '../../app/models/questionType';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import QRCode from 'qrcode';
import DocumentUploadWidget from '../documentUpload/documentUploadWidget';

interface Props{
   registrationEvent: RegistrationEvent
   content: string
   customQuestions: CustomQuestion[]
   publish: () => void
   unPublish: () => void
   publishing: boolean
   setActiveStep: () => void
   registrationEventId: string

}

const baseUrl = import.meta.env.VITE_BASE_URL;

function formatDate(date : Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

export default observer(function ReviewAndPublishRegistration(
    {registrationEvent, content, customQuestions, publish, unPublish, publishing, setActiveStep, registrationEventId} : Props
) {
    const navigate = useNavigate();
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

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
      }, []);

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

      const copyLink = () => {
        const websiteUrl = `${baseUrl}/registerforevent/${registrationEventId}`;
        navigator.clipboard.writeText(websiteUrl).then(() => {
          // Optionally, show a notification or message indicating the link was copied
          toast.success("Link copied to clipboard!");
        }).catch(err => {
          toast.error('Could not copy link: ', err);
        });
      };

      const downloadQRCode = (): void => {
        const websiteUrl = `${baseUrl}/registerforevent/${registrationEventId}`;
      
        QRCode.toDataURL(websiteUrl, { width: 300, margin: 2 }, (err: Error | null | undefined, url: string) => {
          if (err) {
            toast.error(`Could not generate QR code: ${err.message}`);
            return;
          }
      
          const link = document.createElement('a');
          link.href = url;
          link.download = `${registrationEvent.title.replace(/\s+/g, '_')}_QRCode.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      
          toast.success("QR code downloaded!");
        });
      };

      function handleUpload(file: any) {
       //do nothing
      }

    return (
        <>
        <Message info >
          <Message.Header>
              <h3>Review how your website will appear. </h3>
              <p></p>
          </Message.Header>
          {! registrationEvent.published && 
          <Message.Content>

           <p>  When you are satisfied with your website <Button basic color='blue' size='tiny'  onClick={publish} loading={publishing}>Publish</Button> your website so that user's may register.</p>
           <p> To make changes to your website go back to the <Button basic color='blue' size='tiny' onClick={setActiveStep}>Design Screen</Button>.</p>
           
          </Message.Content>
          }
            {registrationEvent.published && 
          <Message.Content>

           <p> This event has been published. The link for the registration page is
             <a href={`${baseUrl}/registerforevent/${registrationEventId}`}><strong>{` ${baseUrl}/registerforevent/${registrationEventId}`}</strong></a>
             <Button basic color='blue' size='tiny' content='copy registration link to clipboard' style={{marginLeft: '5px'}} onClick={copyLink} />
           </p>
           <p>To create and download a QR Code   <Button basic color='blue' size='tiny' content='create QR Code' style={{marginLeft: '5px'}} onClick={downloadQRCode} /></p>
           <p> To make changes to your website go back to the <Button basic color='blue' size='tiny' onClick={setActiveStep}>Design Screen</Button>.</p>
           <p><Button basic color='blue' size='tiny' content='Unpublish' onClick={unPublish} loading={publishing}/> your event to stop users from registering</p>
           
          </Message.Content>
          }
        </Message>
        <Menu inverted color='black' widths={2}>
        <Menu.Item>
        <ArmyLogo content={registrationEvent.title} size="2em" textColor="#FFF" outerStarColor="yellow" innerStarColor="black" />
        </Menu.Item>
        <Menu.Item>
        <Header as='h4' inverted>
      <Icon name='user' color='teal'/>
       <Header.Content>
       The Registrant's Name
       </Header.Content>
      </Header> 
        </Menu.Item>
      </Menu>

      <Grid  stackable style={{padding: '40px' }}>
      <Grid.Row>
      <Grid.Column width={8}>
        <Header as='h3'>
        <Icon name='pencil' />
         <Header.Content>
         {registrationEvent.title}
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
        <Form>
        <FormField required >
             <label>First Name</label>
            <Input value={''}/>
        </FormField>
        <FormField required >
             <label>Last Name</label>
            <Input value={''}/>
        </FormField>
        <FormField required >
             <label> Email</label>
            <Input value={''}/>
       </FormField>
       {customQuestions.sort((a, b) => a.index - b.index).map((question) => (
          <FormField key={question.id} required={question.required}>
            {question.questionType !== QuestionType.Attachment && <label>{question.questionText}</label> }
            {question.questionType === QuestionType.TextInput && <Input value={''}/>}
            {question.questionType === QuestionType.Choice &&
             <Select
             search
             clearable
             placeholder='Select an option'
             options={ question.options
                ? question.options
                    .sort((a, b) => a.index - b.index)
                    .map(option => ({
                      key: option.id, 
                      value: option.optionText, 
                      text: option.optionText, 
                    }))
                : []}
           />
            }
            {question.questionType == QuestionType.Attachment &&
            <>
              <Divider color="black" />
              <Grid>
                <Grid.Row>
                  <Grid.Column width={4}>
                    <strong>{question.questionText}:</strong>
                    {question.required && <Icon name='asterisk' color='red' /> } 
                  </Grid.Column>
                  <Grid.Column width={12}>
                    <DocumentUploadWidget
                      uploadDocument={handleUpload}
                      loading={false}
                      color={'black'}
                      questionId={question.id}
                      error={false}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Divider color="black" />
              </> 
            }
          </FormField>
            ))}
        </Form>
        </Grid.Column>
      </Grid.Row>
      </Grid>
      <Button icon labelPosition='left' floated='left' color='blue' basic size='huge' onClick={setActiveStep} style={{marginLeft: '40px'}}>
                           Design Page
                          <Icon name='arrow alternate circle left' />
                        </Button>
                        {!registrationEvent.published && 
        <Button size='huge' primary content='Publish Web Page' onClick={publish} loading={publishing} style={{marginRight: '40px'}} floated='right'/> }
       {registrationEvent.published && 
       <ButtonGroup size='huge' floated='right' style={{marginRight: '40px'}} >
        <Button  primary content='Copy Registration Link to Clipboard' floated='right' onClick={copyLink} />
        <Button  color='teal' content='Create QR Code' floated='right' onClick={downloadQRCode} />
        <Button  secondary primary content='Go to Your Events'  floated='right' onClick={() => navigate('/myregistrations')} />
        </ButtonGroup>
       }
        </>
    )
})

