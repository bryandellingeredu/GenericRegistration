import { observer } from "mobx-react-lite";
import { Registration } from "../../app/models/registration";
import {  useState } from "react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { Button, ButtonContent, Card, CardContent, CardDescription, CardHeader, CardMeta, Feed, FeedContent, FeedEvent, FeedLabel, Icon, Popup } from "semantic-ui-react";
import { format } from 'date-fns';
import { AnswerAttachment } from "../../app/models/answerAttachment";
import { QuestionType } from "../../app/models/questionType";
import { useStore } from "../../app/stores/store";
import { QuestionOption } from "../../app/models/questionOption";

const apiUrl = import.meta.env.VITE_API_URL;

interface Props{
    registration: Registration
    questions: CustomQuestion[]
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    showQuestions: boolean
    answerAttachments: AnswerAttachment[]
}

export default observer(function AdministerRegistrantCard(
    {registration, questions, deleteRegistration, changeRegistered, showQuestions, answerAttachments } : Props){

      const {  commonStore } = useStore();
      const {token} = commonStore;
        const formattedDate = format(new Date(registration.registrationDate), 'MMM do');
        const orderedQuestions = questions
                                 .filter(x => !x.parentQuestionOption || registration.answers?.find(y => y.answerText === x.parentQuestionOption))
                                .sort((a, b) => a.index - b.index);
        const [isVisible, setIsVisible] = useState(true);

        const isGuid = (str : string) => {
          const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return guidPattern.test(str);
      };

        const getAnswer = (questionId : string) => {
            const answerText =   registration.answers!.find(x => x.customQuestionId === questionId)?.answerText || '';
            if(isGuid(answerText)){
              debugger;
              const allOptions: QuestionOption[] = questions.reduce<QuestionOption[]>((acc, question) => {
                return acc.concat(question.options ?? []);
              }, []);
              const option = allOptions.find(x => x.id === answerText)
              return option?.optionText
            }
            return answerText;
        }

        const getAttachment = (questionId : string) => {
          if (!answerAttachments || answerAttachments.length < 1) return null;
          const filteredAnswerAttachments = answerAttachments.filter(x => x.registrationLookup === registration.id);
          if(filteredAnswerAttachments && filteredAnswerAttachments.length > 0){
            return filteredAnswerAttachments.find(x => x.customQuestionLookup === questionId)
          }else{
            return null;
          }
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

          const downloadAttachment = async (questionId: string) => {
            const answerAttachment = getAttachment(questionId)
            if (answerAttachment) {
              try {
                const headers = new Headers();
                headers.append("Authorization", `Bearer ${token}`);
          
                const requestOptions = {
                  method: "GET",
                  headers: headers,
                };
                
                const attachmentData = await fetch(`${apiUrl}/upload/${answerAttachment.id}`, requestOptions);
                
                if (!attachmentData.ok) {
                  throw new Error('Network response was not ok.');
                }
          
                const data = await attachmentData.arrayBuffer();
                const file = new Blob([data], { type: answerAttachment.fileType });
                const fileUrl = window.URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = fileUrl;
                a.download = answerAttachment.fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(fileUrl);
              } catch (err) {
                console.error(err);
              }
            }
          };

        return(
            <Card color='teal'style={style}>
            <CardContent>
             <CardHeader>{registration.firstName} {registration.lastName}</CardHeader>
             <CardMeta >
               <a href={`mailto:{registration.email}`} style={{color: ' #0000FF'}}>
                    {registration.email}
              </a>
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
                    {question.questionType !== QuestionType.Attachment && getAnswer(question.id)}
                    {question.questionType === QuestionType.Attachment && !getAttachment(question.id) && 
                     <span></span>
                    }
                     {question.questionType === QuestionType.Attachment && getAttachment(question.id) && 
                      <Button animated='vertical'
                       size='tiny'
                        basic color='blue'
                        onClick={() => downloadAttachment(question.id)}
                         type="button"
                         style={{marginLeft: '10px'}}>
                      <ButtonContent hidden>Download</ButtonContent>
                      <ButtonContent visible>
                        <Icon name='paperclip' />{getAttachment(question.id)!.fileName || 'file'} 
                      </ButtonContent>
                    </Button>
                     }
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
    })