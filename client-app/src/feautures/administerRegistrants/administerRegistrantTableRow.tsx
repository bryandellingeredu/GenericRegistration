import { Button, ButtonContent, Icon, Popup, Radio, TableCell, TableRow,  } from "semantic-ui-react";
import { Registration } from "../../app/models/registration";
import {  useState } from "react";
import { CustomQuestion } from "../../app/models/customQuestion";
import { format } from "date-fns";

interface Props{
    registration: Registration
    questions: CustomQuestion[]
    deleteRegistration: (id: string) => void
    changeRegistered: (id: string, registered: boolean) => void
    showQuestions: boolean
}

export default function AdministerRegistrantTableRow(
  {registration, questions, deleteRegistration, changeRegistered, showQuestions } : Props){
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
              <TableCell>{getAnswer(orderedQuestions[0].id)}</TableCell>
            </>
          )}
        </TableRow>
    
        {/* Render additional rows for the remaining questions if showQuestions is true */}
        {showQuestions &&
          orderedQuestions.slice(1).map((question, index) => (
            <TableRow key={index}>
              <TableCell>{question.questionText}</TableCell>
              <TableCell>{getAnswer(question.id)}</TableCell>
            </TableRow>
          ))}
      </>
    );
    
}