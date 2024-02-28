import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Form, FormField, Input } from "semantic-ui-react";
import DatePicker from "react-datepicker";

interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void;
    formSubmitted: boolean,
    setFormDirty: () => void;
}

export default observer (function CreateUpdateRegistrationDetails(
    {registrationEvent, setRegistrationEvent, formSubmitted, setFormDirty} : Props
){


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationEvent({ ...registrationEvent, [name]: value });
        setFormDirty();
    };

    const handleStartDateChange = (date: Date | null) => {
        if(date){
        setRegistrationEvent({ ...registrationEvent, ['startDate']: date });
        setFormDirty();
        }
      };

      const handleEndDateChange = (date: Date | null) => {
        if(date){
        setRegistrationEvent({ ...registrationEvent, ['endDate']: date });
        setFormDirty();
        }
      };

    return(
      <Form>
      <FormField error={(!registrationEvent.title || !registrationEvent.title.trim()) && formSubmitted} required>
    <label>Event Title</label>
    <Input
     placeholder="Enter the title for the event"
     value={registrationEvent.title}
     name="title"
     onChange={handleInputChange}
     />
</FormField>
<FormField error={(!registrationEvent.location || !registrationEvent.location.trim()) && formSubmitted} required>
    <label>Location</label>
    <Input
     placeholder="Where will the event occur"
     value={registrationEvent.location}
     name="location"
     onChange={handleInputChange}
     />
</FormField>
        <FormField error={!registrationEvent.startDate && formSubmitted} required>
        <label>Start Date</label>
        <DatePicker
          selected={registrationEvent.startDate}
          onChange={handleStartDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Date Event is Starting"
        />
        </FormField>
        <FormField error={!registrationEvent.endDate && formSubmitted} required>
        <label>End Date</label>
        <DatePicker
          selected={registrationEvent.endDate}
          onChange={handleEndDateChange}
          dateFormat="MM/dd/yyyy"
          placeholderText="Date Event is Ending"
        />
        </FormField>

      </Form>
    )
})