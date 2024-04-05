import { observer } from "mobx-react-lite";
import { Button, ButtonContent, Icon, Popup, Radio, TableCell, TableRow,  } from "semantic-ui-react";
import { Registration } from "../../app/models/registration";
import {  useState } from "react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { format } from "date-fns";
import { AnswerAttachment } from "../../app/models/answerAttachment";
import { useStore } from "../../app/stores/store";
import { QuestionType } from "../../app/models/questionType";

const apiUrl = import.meta.env.VITE_API_URL;

interface Props{
    registration: Registration
    questions: CustomQuestion[]
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    showQuestions: boolean
    answerAttachments: AnswerAttachment[]
}

export default function AdministerRegistrantTableRow(
  {registration, questions, deleteRegistration, changeRegistered, showQuestions, answerAttachments } : Props){

  const {  commonStore } = useStore();
  const {token} = commonStore;
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [style, setStyle] = useState({});
  const formattedDate = format(new Date(registration.registrationDate), 'MMM do');

  const handleDelete = () => {
    setStyle({ transition: 'opacity 1s ease', opacity: 0 });
    setTimeout(() => {
      setIsVisible(false);
      deleteRegistration(registration.id);
    }, 600); 
  };

    const orderedQuestions = questions.sort((a, b) => a.index - b.index);

    const getAnswer = (questionId : string) => {
        return  registration.answers!.find(x => x.customQuestionId === questionId)?.answerText || '';
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

    const maxRowSpan = showQuestions ? orderedQuestions.length : 1;
    
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

    return (
      <>
        <TableRow style={style}>
          <TableCell rowSpan={maxRowSpan}>
            <Popup
              trigger={
                <Button animated='vertical' basic color='red' size='tiny' onClick={() => setIsOpen(!isOpen)}>
                  <ButtonContent hidden>Delete</ButtonContent>
                  <ButtonContent visible>
                    <Icon name='x' />
                  </ButtonContent>
                </Button>
              }
              content={popupContent}
              on='click'
              open={isOpen}
              onClose={() => setIsOpen(false)}
              onOpen={() => setIsOpen(true)}
              position='top right'
            />
          </TableCell>
          <TableCell rowSpan={maxRowSpan}>
        <Radio
          toggle
          label={registration.registered ? 'Approved' : 'Not Approved'}
          checked={registration.registered}
          onChange={handleRegisteredChange}
        />
      </TableCell>
          <TableCell rowSpan={maxRowSpan}>{registration.firstName}</TableCell>
          <TableCell rowSpan={maxRowSpan}>{registration.lastName}</TableCell>
          <TableCell rowSpan={maxRowSpan}>     <a href={`mailto:{registration.email}`} style={{color: ' #0000FF'}}>
                    {registration.email}
              </a></TableCell>
          <TableCell rowSpan={maxRowSpan}>{`Registered on ${formattedDate}`}</TableCell>
    
          {showQuestions && (
            <>
              <TableCell>{orderedQuestions[0].questionText}</TableCell>
              <TableCell>
                {orderedQuestions[0].questionType !== QuestionType.Attachment &&  getAnswer(orderedQuestions[0].id)}
                {orderedQuestions[0].questionType === QuestionType.Attachment && !getAttachment(orderedQuestions[0].id) && 
                     <span></span>
                }
                {orderedQuestions[0].questionType === QuestionType.Attachment && getAttachment(orderedQuestions[0].id) && 
                      <Button animated='vertical'
                       size='tiny'
                        basic color='blue'
                        onClick={() => downloadAttachment(orderedQuestions[0].id)}
                         type="button">
                      <ButtonContent hidden>Download</ButtonContent>
                      <ButtonContent visible>
                        <Icon name='paperclip' />{getAttachment(orderedQuestions[0].id)!.fileName || 'file'} 
                      </ButtonContent>
                    </Button>
                 }

                </TableCell>
            </>
          )}
        </TableRow>
    
        {/* Render additional rows for the remaining questions if showQuestions is true */}
        {showQuestions &&
          orderedQuestions.slice(1).map((question, index) => (
            <TableRow key={index}>
              <TableCell>{question.questionText}</TableCell>
              <TableCell>
              {question.questionType !== QuestionType.Attachment &&  getAnswer(question.id)}
                {question.questionType === QuestionType.Attachment && !getAttachment(question.id) && 
                     <span></span>
                }
                {question.questionType === QuestionType.Attachment && getAttachment(question.id) && 
                      <Button animated='vertical'
                       size='tiny'
                        basic color='blue'
                        onClick={() => downloadAttachment(question.id)}
                         type="button">
                      <ButtonContent hidden>Download</ButtonContent>
                      <ButtonContent visible>
                        <Icon name='paperclip' />{getAttachment(question.id)!.fileName || 'file'} 
                      </ButtonContent>
                    </Button>
                 }
              </TableCell>
            </TableRow>
          ))}
      </>
    );
    
}