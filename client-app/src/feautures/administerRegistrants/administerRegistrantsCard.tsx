import { Registration } from "../../app/models/registration";
import {  useState } from "react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Feed, FeedContent, FeedEvent, FeedLabel, Icon, Popup } from "semantic-ui-react";
import { format } from 'date-fns';

interface Props{
    registration: Registration
    questions: CustomQuestion[]
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    showQuestions: boolean
}

export default function AdministerRegistrantCard(
    {registration, questions, deleteRegistration, changeRegistered, showQuestions } : Props){

        const formattedDate = format(new Date(registration.registrationDate), 'MMM do');
        const orderedQuestions = questions.sort((a, b) => a.index - b.index);
        const [isVisible, setIsVisible] = useState(true);

        const getAnswer = (questionId : string) => {
            return  registration.answers!.find(x => x.customQuestionId === questionId)?.answerText || '';
        }
    

        const handleRegisteredChange = () => {
            changeRegistered(registration.id, !registration.registered);
          }

          const [style, setStyle] = useState({});

          const handleDelete = () => {
            setStyle({ transition: 'opacity 1s ease', opacity: 0 });
            setTimeout(() => {
              setIsVisible(false);
              deleteRegistration(registration.id);
            }, 600); 
          };
        

          const [isOpen, setIsOpen] = useState(false);

          const popupContent = (
            <div>
              <p>Are you sure you want to delete this user?</p>
              <Button color="red" onClick={handleDelete}>
                Yes
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                No
              </Button>
            </div>
          );
          if (!isVisible) {
            return null;
          }

        return(
            <Card color='teal'style={style}>
            <CardContent>
             <CardHeader>{registration.firstName} {registration.lastName}</CardHeader>
             <CardMeta >
               <a href={`mailto:{registration.email}`} style={{color: ' #0000FF'}}>
                    {registration.email}
              </a>
             </CardMeta>
             <CardMeta>
                <Icon name='phone' /> {registration.phone}
             </CardMeta>
             </CardContent>
             <CardContent>
             <CardDescription>
                <p>Registered on {formattedDate}</p>
                <p>This User is  {registration.registered ? 'Approved' : 'Not Approved'}</p>
             </CardDescription>
             </CardContent>
         
          {showQuestions && 
          <CardContent>
               <Feed>
               {orderedQuestions.map((question, index) => (
                <FeedEvent key={index}>
                   <FeedContent>
                    <strong>{question.questionText} :</strong>
                   {getAnswer(question.id)}
                   </FeedContent>
                </FeedEvent>
                ))}
               </Feed>
          </CardContent>
          }
              <CardContent extra>
                <div className='ui two buttons'>
                    <Button basic color='teal'
                      onClick={handleRegisteredChange}
                      content={registration.registered ? 'Remove Approval' : 'Approve User'}/>
                        <Popup
              trigger={
                <Button color='red' basic onClick={() => setIsOpen(!isOpen)}>
                   Delete User
                </Button>
              }
              content={popupContent}
              on='click'
              open={isOpen}
              onClose={() => setIsOpen(false)}
              onOpen={() => setIsOpen(true)}
              position='top right'
            />
             
                </div>
          </CardContent>
            </Card>
        )
    }