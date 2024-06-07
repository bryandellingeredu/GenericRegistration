import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ManageRegistrationNavbar from '../../app/layout/ManageRegistrationNavbar';
import { useStore } from '../../app/stores/store';
import {
  Button,
  Container,
  Divider,
  Form,
  FormField,
  FormGroup,
  Header,
  Icon,
  Input,
  Label,
  Message,
  Segment,
  SegmentGroup,
} from 'semantic-ui-react';
import agent from '../../app/api/agent';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default observer(function ManageAdmin() {
  const navigate = useNavigate();
  const { userStore, responsiveStore } = useStore();
  const { isMobile } = responsiveStore;
  const { user } = userStore;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminEmailError, setNewAdminEmailError] = useState(false);

  useEffect(() => {
    if (user && user.roles && user.roles.includes('Administrators'))
      setIsAdmin(true);
  }, [user]);

  useEffect(() => {
    if (isAdmin && adminEmails.length < 1) {
      setLoading(true);
      agent.Account.listAdmins().then((response) => {
        setAdminEmails(response.map((x) => x.mail));
        setLoading(false);
      });
    }
  }, [isAdmin, adminEmails]);

  useEffect(() => {
    if (isAdmin && userEmails.length < 1) {
      agent.Account.listEmails().then((response) => {
        setUserEmails(response);
      });
    }
  }, [isAdmin, userEmails]);

  const handleDeleteButton = async (email: string) => {
    if (adminEmails.length > 1) {
      setAdminEmails(adminEmails.filter((adminEmail) => adminEmail !== email));
      try {
        await agent.Account.removeAdmin(email);
      } catch (e: any) {
        console.log(e);
        if (e && e.message) {
          toast.error('An error occurred: ' + e.message);
        } else {
          toast.error('an error occured');
        }
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      !email ||
      !emailRegex.test(email) ||
      !(email.endsWith('.mil') || email.endsWith('armywarcollege.edu'))
    );
  };

  const handleSubmit = async () => {
    if (!newAdminEmail) return;

    if (
      adminEmails
        .map((x) => x.toLowerCase())
        .includes(newAdminEmail.toLocaleLowerCase())
    ) {
      setNewAdminEmail('');
      return;
    }

    const error = validateEmail(newAdminEmail);
    setNewAdminEmailError(error);
    if (!error) {
      setAdminEmails([...adminEmails, newAdminEmail]);
      setNewAdminEmail('');
      try {
        await agent.Account.addAdmin(newAdminEmail);
      } catch (e: any) {
        console.log(e);
        if (e && e.message) {
          toast.error('An error occurred: ' + e.message);
        } else {
          toast.error('an error occured');
        }
      }
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdminEmailError(false);
    const emailInput = event.target.value;
    const error = validateEmail(emailInput);
    if (error) {
      setNewAdminEmail(emailInput);
    } else {
      if (
        adminEmails
          .map((x) => x.toLowerCase())
          .includes(emailInput.toLocaleLowerCase())
      ) {
        setNewAdminEmail('');
        return;
      }
      setAdminEmails([...adminEmails, emailInput]);
      setNewAdminEmail('');
      try {
        await agent.Account.addAdmin(emailInput);
      } catch (e: any) {
        console.log(e);
        if (e && e.message) {
          toast.error('An error occurred: ' + e.message);
        } else {
          toast.error('an error occured');
        }
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <ManageRegistrationNavbar />
      {!isAdmin && (
        <Container style={{ marginTop: '20px' }}>
          <Message error>
            <Message.Header>Unauthorized</Message.Header>
            <Message.Content>
              You are not authorized to view this page
            </Message.Content>
          </Message>
        </Container>
      )}
      {isAdmin && loading && <LoadingComponent content="loading admins..." />}

      {isAdmin && !loading && (
        <>
          <Divider horizontal>
            <Header as="h1">
              <Icon name="user plus" />
              Manage Administrators
            </Header>
          </Divider>

          <SegmentGroup style={{ marginTop: '40px', padding: '20px' }}>
            <Segment textAlign="center" color="teal">
              <Header icon color="teal" as="h4">
                <Icon name="user plus" />
                Current Administrators
              </Header>
            </Segment>
            <Segment>
              {adminEmails.map((admin) => (
                <Button
                  key={admin}
                  icon
                  labelPosition="left"
                  basic
                  color="teal"
                  size="large"
                  onClick={() => handleDeleteButton(admin)}
                >
                  <Icon name="x" color="red" />
                  {admin}
                </Button>
              ))}
            </Segment>
            <Segment>
              <Header icon color="teal" textAlign="center" as="h4">
                <Icon name="plus" />
                Add a New Administrator
              </Header>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <FormField required width={16} error={newAdminEmailError}>
                    <Input
                      fluid
                      icon="envelope"
                      iconPosition="left"
                      placeholder="Edu or Mil Email Address"
                      value={newAdminEmail}
                      onChange={handleChange}
                      onBlur={handleSubmit}
                      list="emailOptions"
                    />
                    <datalist id="emailOptions">
                      {userEmails.map((email, index) => (
                        <option key={index} value={email} />
                      ))}
                    </datalist>
                    {newAdminEmailError && (
                      <Label basic color="red" pointing>
                        Please enter a valid .mil or armywarcollege.edu email
                        address
                      </Label>
                    )}
                  </FormField>
                </FormGroup>
              </Form>
            </Segment>
            <Segment clearing>
              <Button
                size="huge"
                primary
                floated="right"
                onClick={goBack}
                icon
                labelPosition="left"
              >
                <Icon name="arrow left" />
                Back
              </Button>
            </Segment>
          </SegmentGroup>
        </>
      )}
    </>
  );
});
