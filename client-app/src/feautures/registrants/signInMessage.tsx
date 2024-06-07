import { Button, Divider, Header, Icon, Message, MessageItem, MessageList } from "semantic-ui-react";
interface Props{
    registrationIsOpen: () => boolean;
    isMobile: boolean
    title: string
    id: string | undefined
}

export default function SignInMessage({registrationIsOpen, isMobile, title, id} : Props){

    const handleSignIn = () =>{
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const url = `${baseUrl}?redirecttopage=registerforevent/${id}`
        window.location.href = url;
      }

    return(
        <Message info>
        {!isMobile && 
            <Message.Header>
                <Divider horizontal>
                    <Header as='h4'>
                        <Icon name='tag' />
                        Register For {title}
                     </Header>
                </Divider>
            </Message.Header>}
            <Message.Content>
                <h4>
                    {registrationIsOpen() ? 'In order to register for this event you will need to sign in' : 'Registration is Closed for this Event' }
                </h4>
            </Message.Content>
                    {registrationIsOpen() && 
                    <MessageList>
                        <MessageItem>You can sign in with an Edu Account</MessageItem>
                        <MessageItem>You can sign in with a CAC</MessageItem>
                        <MessageItem>You can sign in by having a confirmation link emailed to you</MessageItem>
                    </MessageList>
                     }
                    {registrationIsOpen() && 
                        <Message.Content>
                            <Button size="huge" primary content='Sign In' style={{marginTop: '40px'}} onClick={handleSignIn}/>
                        </Message.Content>
                    }
         </Message>
    )
}