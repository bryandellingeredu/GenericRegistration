import { observer } from "mobx-react-lite";
import { Form, FormField, Input, Button, FormGroup, Icon, Divider, Header } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { v4 as uuidv4 } from 'uuid';
import agent from "../../app/api/agent";
import { toast } from 'react-toastify';
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useNavigate } from "react-router-dom";


interface Props {
  registrationEventId : string
  setRegistrationEventId: (id: string) => void
  setActiveStep: () => void
  formIsDirty: boolean
  setFormDirty: () => void
  setFormClean: () => void
}

interface CustomInputProps {
  value?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const DetailsForm: React.FC<Props> = observer((
  {registrationEventId, setRegistrationEventId, setActiveStep, formIsDirty, setFormClean, setFormDirty} : Props) => {
  const [eventTitle, setEventTitle] = useState<string>("");
  const [overview, setOverview] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [formError, setFormError] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<boolean>(false);
  const [startError, setStartError] = useState<boolean>(false);
  const [endError, setEndError] = useState<boolean>(false);
  const [overviewError, setOverviewError] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getRegistrationEvent();
  }, [registrationEventId]);

  const handleTitleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEventTitle(e.target.value);
    setTitleError(false);
    setFormDirty();
  };

  const handleLocationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setFormDirty();
  };

  const handleOverviewChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setOverview(e.target.value);
    setOverviewError(false);
    setFormDirty();
  };

  // Separate handlers for start and end dates
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setStartError(false);
    setFormDirty();
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setEndError(false);
    setFormDirty();
  };

  const getRegistrationEvent = async () => {
    if(registrationEventId){
      setLoading(true);
      try{
          const registrationEvent : RegistrationEvent = await agent.RegistrationEvents.details(registrationEventId);
          setEventTitle(registrationEvent.title);
          setLocation(registrationEvent.location);
          setOverview(registrationEvent.overview);
          setStartDate(registrationEvent.startDate);
          setEndDate(registrationEvent.endDate);
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


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if(formIsDirty || !registrationEventId){
    setUpdating(true);
    e.preventDefault();
    setFormError(false);
    setTitleError(false);
    setStartError(false);
    setEndError(false);
    setOverviewError(false);
    let localFormError = false;
    
    if (!eventTitle) {
        setTitleError(true);
        localFormError = true;
    }
    if (!startDate) {
        setStartError(true);
        localFormError= true;
    }
    if (!endDate) {
        setEndError(true);
        localFormError = true;
    }
    if (!overview) {
        setOverviewError(true);
        localFormError = true;
    }

    setFormError(localFormError);

    if (!localFormError && startDate && endDate) {
      const id = registrationEventId || uuidv4();
        const registrationEvent: RegistrationEvent = {
            id, 
            title: eventTitle, 
            location, 
            overview,
            startDate,
            endDate
        };       
        try {
            await agent.RegistrationEvents.createUpdate(registrationEvent);
            toast.success("Save was successful!"); 
            setRegistrationEventId(id);
            setFormClean();
            setActiveStep();
        } catch (error: any) {
          console.log(error);
          if (error && error.message) {
            toast.error("An error occurred: " + error.message);
          } else {
            toast.error("Save failed!");
          }
        } finally {
            setUpdating(false);
        }
    } else {
        setUpdating(false);
    }
  }
};


  const CustomInput: React.FC<CustomInputProps> = ({ value, onClick }) => (
    <Input
      fluid
      icon="calendar"
      iconPosition="left"
      placeholder="Click to select a date"
      value={value}
      onClick={onClick}
      readOnly
      label={{ icon: "asterisk" }}
      labelPosition="right corner"
    />
  );
  if (loading) return <LoadingComponent content="Loading Form"/>

  return (
    <div style={{ padding: "40px" }}>
    <Divider horizontal>
    <Header as='h2'>
      <Icon name='info' />
      Details
    </Header>
  </Divider>
    <Form  size="huge" onSubmit={handleSubmit}>
           <FormGroup widths='equal'>
    <FormField error={titleError}>
      <label>Event Title</label>
      <Input
        label={{ icon: "asterisk" }}
        labelPosition="right corner"
        placeholder="Enter the title for the event"
        icon="pencil"
        iconPosition="left"
        value={eventTitle}
        onChange={handleTitleInputChange}
      />
    </FormField>
    <FormField>
      <label>Location</label>
      <Input
        placeholder="Where will the event occur"
        icon="map marker"
        iconPosition="left"
        value={location}
        onChange={handleLocationInputChange}
      />
    </FormField>
    </FormGroup>
    <FormGroup widths='equal'>
      <FormField error={startError}>
        <label>Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Date Event is Starting"
          customInput={<CustomInput />}
        />
      </FormField>
      <FormField error={endError}>
        <label>End Date</label>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Date Event is Ending"
          customInput={<CustomInput />}
        />
      </FormField>
    </FormGroup>
    <FormField error={overviewError}>
    <label>Overview</label>
  <div style={{ position: 'relative' }}>
    <TextareaAutosize
      style={{ paddingRight: '2.5em' }} 
      placeholder="Provide a brief overview of this event"
      onChange={handleOverviewChange}
      value={overview}
    />
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
      <Icon name="asterisk" />
    </div>
  </div>
    </FormField>
    <Button type='button' size="huge" color='grey' floated="left" onClick={() => navigate('/myRegistrations')}>
      Cancel
    </Button>
    {(formIsDirty || !registrationEventId) && 
    <Button type="submit" size="huge" color="teal" loading={updating} floated="right">
      Save and Continue
    </Button>
   }
   {!formIsDirty && registrationEventId &&
    <Button type="button" size="huge" color="teal" floated="right" onClick={() => setActiveStep()}>
    Go To Questions
   </Button>
   }
  </Form>
  </div>
  );
});

export default DetailsForm;