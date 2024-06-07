import { Button, Grid, Header, Icon } from 'semantic-ui-react';
import CreateUpdateReqistrationDetails from './createUpdateReqistrationDetails';
import CreateUpdateRegistrationInfo from './createUpdateRegistrationInfo';
import CreateUpdateRegistrationOwners from './createUpdateRegistrationOwners';
import CreateUpdateRegistrationSettings from './createUpdateRegistrationSettings';
import CreateUpdateRegistrationQuestions from './createUpdateRegistrationQuestions';
import { RegistrationEvent } from '../../app/models/registrationEvent';
import { RegistrationEventOwner } from '../../app/models/registrationEventOwner';
import { CustomQuestion } from '../../app/models/customQuestion';
import { toast } from 'react-toastify';

interface Props {
  registrationEvent: RegistrationEvent;
  setRegistrationEvent: (event: RegistrationEvent) => void;
  formSubmitted: boolean;
  setFormDirty: () => void;
  content: string;
  setContent: (newContent: string) => void;
  registrationEventOwners: RegistrationEventOwner[];
  setRegistrationEventOwners: (
    newRegistrationEventOwners: RegistrationEventOwner[],
  ) => void;
  registrationEventId: string;
  saveFormInBackground: () => void;
  userEmails: string[];
  formisDirty: boolean;
  savingFromStepClick: boolean;
  saving: boolean;
  saveForm: () => void;
  registeredUsersIndicator: boolean;
  customQuestions: CustomQuestion[];
  setCustomQuestions: (newCustomQuestions: CustomQuestion[]) => void;
  handleReviewClick: () => void;
}

export default function DesignStep({
  registrationEvent,
  setRegistrationEvent,
  formSubmitted,
  setFormDirty,
  content,
  setContent,
  registrationEventOwners,
  setRegistrationEventOwners,
  registrationEventId,
  saveFormInBackground,
  userEmails,
  formisDirty,
  savingFromStepClick,
  saving,
  saveForm,
  registeredUsersIndicator,
  customQuestions,
  setCustomQuestions,
  handleReviewClick,
}: Props) {
  return (
    <Grid stackable style={{ marginTop: '20px', padding: '40px' }}>
      <Grid.Row>
        <Grid.Column width={8}>
          <Header as="h2" textAlign="center">
            <Icon name="pencil" />
            <Header.Content>
              Event Details
              <Header.Subheader>
                The Basic details of your event
              </Header.Subheader>{' '}
              {/* Add your subheader text here */}
            </Header.Content>
          </Header>
          <CreateUpdateReqistrationDetails
            registrationEvent={registrationEvent}
            setRegistrationEvent={setRegistrationEvent}
            formSubmitted={formSubmitted}
            setFormDirty={setFormDirty}
          />

          <Header as="h2" textAlign="center">
            <Icon name="info" />
            <Header.Content>
              Event Info
              <Header.Subheader>
                Enter information about your event, Overview, Agenda, Speakers
                etc.
              </Header.Subheader>
            </Header.Content>
          </Header>
          <CreateUpdateRegistrationInfo
            content={content}
            setContent={setContent}
            setFormDirty={setFormDirty}
          />

          <Header as="h2" textAlign="center">
            <Icon name="user plus" />
            <Header.Content>
              Additional Event Administrators
              <Header.Subheader>
                Enter additional administrators for this event
              </Header.Subheader>
              <Header.Subheader>
                Pro Tip! If you logged in with your Edu account add your .Mil
                account here
              </Header.Subheader>
            </Header.Content>
          </Header>
          <CreateUpdateRegistrationOwners
            registrationEventOwners={registrationEventOwners}
            setRegistrationEventOwners={setRegistrationEventOwners}
            registrationEventId={registrationEventId}
            setFormDirty={setFormDirty}
            saveFormInBackground={saveFormInBackground}
            userEmails={userEmails}
          />

          <Header as="h2" textAlign="center">
            <Icon name="settings" />
            <Header.Content>
              Settings
              <Header.Subheader>Configure your event</Header.Subheader>
            </Header.Content>
          </Header>
          <CreateUpdateRegistrationSettings
            registrationEvent={registrationEvent}
            setRegistrationEvent={setRegistrationEvent}
            setFormDirty={setFormDirty}
            saveFormInBackground={saveFormInBackground}
          />

          {formisDirty && !savingFromStepClick && (
            <Button
              floated="right"
              color="blue"
              basic
              size="huge"
              loading={saving}
              onClick={saveForm}
            >
              {' '}
              Save Pending Changes
            </Button>
          )}
        </Grid.Column>
        <Grid.Column width={8}>
          <Header as="h2">
            <Icon name="question" />
            <Header.Content>
              Event Questions
              {registeredUsersIndicator && (
                <Header.Subheader>
                  People have already registred for your event you MAY NOT
                  change questions' :
                </Header.Subheader>
              )}
              {!registeredUsersIndicator && (
                <>
                  <Header.Subheader>
                    <p>
                      'Use the "Add" button to design questions for your form.
                    </p>
                    <p>
                      For limited-availability options (e.g., class size or
                      event attendance), select the "Choice" type and enter your
                      limit. For example, to limit attendance at a dinner to 20
                      people, choose the "Choice" type, label it "Attend
                      Dinner", and add the choices "Yes" with a limit of 20 and
                      "No" with no limit.'
                    </p>
                    <p>
                      To conditionally hide or show questions, select a "Choice"
                      type question. To display additional questions based on a
                      specific choice, use the "branch" button to add
                      conditional questions.
                    </p>
                  </Header.Subheader>
                </>
              )}
            </Header.Content>
          </Header>
          <CreateUpdateRegistrationQuestions
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
            setFormDirty={setFormDirty}
            registrationEventId={registrationEventId}
            registeredUsersIndicator={registeredUsersIndicator}
          />
          <Button
            icon
            labelPosition="right"
            floated="right"
            color="blue"
            basic
            size="huge"
            disabled={
              savingFromStepClick ||
              !registrationEvent.title ||
              !registrationEvent.title.trim() ||
              !registrationEvent.location ||
              !registrationEvent.location.trim() ||
              !registrationEvent.startDate ||
              !registrationEvent.endDate ||
              !registrationEvent.certified
            }
            loading={savingFromStepClick}
            onClick={handleReviewClick}
          >
            Review and Publish
            <Icon name="arrow alternate circle right" />
          </Button>
          {formisDirty && !savingFromStepClick && (
            <Button
              floated="right"
              color="blue"
              basic
              size="huge"
              loading={saving}
              onClick={saveForm}
            >
              {' '}
              Save Pending Changes
            </Button>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
