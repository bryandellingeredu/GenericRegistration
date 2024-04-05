
import { observer } from "mobx-react-lite";
import {  useEffect, useState} from "react";
import { useStore } from "../../app/stores/store";
import { Button, Container, Divider, Form, FormField, Header, HeaderSubheader, Icon, Input, Segment } from "semantic-ui-react";
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { EmailLinkDTO } from "../../app/models/emailLinkDTO";

export default observer ( function SendEmailLink() {
    const { id } = useParams();
    const {responsiveStore, commonStore} = useStore();
    const {isMobile} = responsiveStore;
    const [formIsDirty, setFormIsDirty] = useState(false);
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
      // Call the method from the store to handle the redirect
     commonStore.setRedirectToPage('');
  }, []);

    const handleSubmit = async() => {
       if(!saving){
       setFormIsDirty(true);
       if (validateEmail(email)){      
        try{
          debugger;
          setSaving(true);
          const emailLinkDTO : EmailLinkDTO = {registrationEventId: id!, email: email}
          await agent.EmailLinks.sendLink(emailLinkDTO);
          toast.success("an registration link was sent to your email");
          setEmailSent(true);
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("sending email link failed!");
          }
        } finally {
          setSaving(false);
        }
       }
      }
    }

    const validateEmail = (email : string) => {
        // This is a simple regex for basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      const handleEmailChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
      };

      const isEmailValid = validateEmail(email) || !formIsDirty;

    return(
        <div className="homepage-background">
             <Container fluid>
             {!isMobile && 
                <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '3.5em' }} color='yellow' >
                    Carlisle Barricks Registration Portal
                </Header>
                }
              {isMobile && 
                <Header as='h1'  textAlign='center' style={{ textTransform: 'uppercase', fontSize: '2em' }} color='yellow' >
                    Registration Portal
                </Header>
                }
                {!emailSent && 
                <Segment color='teal' >

                  <Form size={isMobile ? 'tiny' : 'huge'} onSubmit={handleSubmit} >
                  <Divider horizontal >
                        <Header as='h4' color='teal'>
                        <Icon name='paperclip' />
                            Email Me a Registration Link
                        </Header>
                    </Divider>
                    <FormField required={true} error={formIsDirty && !isEmailValid}>
                    {isMobile &&
                     <Input 
                     label={{ icon: 'asterisk' }}
                     labelPosition='right corner'
                     placeholder='Enter Email Address...'
                     icon='envelope' iconPosition='left'
                     value={email}
                     onChange={handleEmailChange}
                     error={!isEmailValid}
                    />
                    }
                    {!isMobile &&
                    <Input 
                        style={{minWidth: '600px'}}
                        label={{ icon: 'asterisk' }}
                        labelPosition='right corner'
                        placeholder='Enter Email Address...'
                        icon='envelope' iconPosition='left'
                        value={email}
                        onChange={handleEmailChange}
                        error={!isEmailValid}
                    />
                  }
      {!isEmailValid && <span style={{color: 'red'}}>Please enter a valid email address.</span>}
    </FormField>
                    <FormField>
                        <Button type='submit' content='Send Link' size={isMobile ? 'tiny' : 'huge'}
                         color='teal' loading={saving} />
                    </FormField>
                  </Form>
                </Segment>
               }
              {emailSent &&
                <Segment color='teal'>
                  <Header as='h2' icon textAlign="center">
                  <Icon name='paper plane outline' />
                    Registration Link Sent
                    <HeaderSubheader>
                      A link to complete your registration has been sent to your email. Please check your inbox (and the spam folder, just in case) to continue with your event registration.
                    </HeaderSubheader>
                  </Header>
                  <HeaderSubheader style={{ marginTop: '20px', textAlign: 'center' }}>
                      Please close this page and check your email to proceed.
                  </HeaderSubheader>
                </Segment>
              }
             </Container>
        </div>
    )
})