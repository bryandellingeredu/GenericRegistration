import { observer } from "mobx-react-lite";
import { RegistrationEvent } from "../../app/models/registrationEvent";
import { Button, Divider, Form, FormCheckbox, FormField, Input, Radio } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from "../../app/stores/store";
import CUIWarningModal from "./CUIWarningModal";

interface Props{
    registrationEvent: RegistrationEvent
    setRegistrationEvent: (event : RegistrationEvent) => void
    formSubmitted: boolean
    setFormDirty: () => void
}

export default observer (function CreateUpdateRegistrationDetails(
    {registrationEvent, setRegistrationEvent, formSubmitted, setFormDirty} : Props
){

    const {modalStore} = useStore();
    const {openModal} = modalStore;

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

      const handleCertifiedChange = () => {
        setRegistrationEvent({ ...registrationEvent, certified: !registrationEvent.certified });
        setFormDirty();
      }

      const handleCertifyButtonClick = () => {
        openModal(<CUIWarningModal />)
      }

    return(
      <Form>
      <FormField required error={!registrationEvent.certified && formSubmitted}>
       <label>I certify I will not require any  &nbsp;
       <Button color='black' basic CUI size='tiny' content='CUI' onClick={handleCertifyButtonClick} />
        or &nbsp;
        <Button color='black' basic CUI size='tiny' content='PII' onClick={handleCertifyButtonClick} />
          when creating questions
       </label>
       <Radio
                slider
                label={registrationEvent.certified ? 'Certified' : 'Not Certified'}
                checked={registrationEvent.certified}
                onChange={handleCertifiedChange}
              />
       <Divider />
      </FormField>
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