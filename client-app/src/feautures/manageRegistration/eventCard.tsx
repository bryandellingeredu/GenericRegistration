import { observer } from 'mobx-react-lite';
import { RegistrationEvent } from '../../app/models/registrationEvent';
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMeta,
  Header,
  HeaderContent,
  Icon,
  Label,
} from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../app/stores/store';
import Confirmation from '../../app/common/modals/Confirmation';
import { toast } from 'react-toastify';
import { useState } from 'react';
import agent from '../../app/api/agent';
import QRCode from 'qrcode';

interface Props {
  event: RegistrationEvent;
  removeEvent: (id: string) => void;
}

const baseUrl = import.meta.env.VITE_BASE_URL;

export default observer(function EventCard({ event, removeEvent }: Props) {
  const navigate = useNavigate();
  const { modalStore } = useStore();
  const { openModal, closeModal } = modalStore;
  const [deleting, setDeleting] = useState(false);
  const { responsiveStore } = useStore();
  const { isMobile } = responsiveStore;

  const copyLink = () => {
    const websiteUrl = `${baseUrl}/registerforevent/${event.id}`;
    navigator.clipboard
      .writeText(websiteUrl)
      .then(() => {
        // Optionally, show a notification or message indicating the link was copied
        toast.success('Link copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Could not copy link: ', err);
      });
  };

  const downloadQRCode = (): void => {
    const websiteUrl = `${baseUrl}/registerforevent/${event.id}`;

    QRCode.toDataURL(
      websiteUrl,
      { width: 300, margin: 2 },
      (err: Error | null | undefined, url: string) => {
        if (err) {
          toast.error(`Could not generate QR code: ${err.message}`);
          return;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/\s+/g, '_')}_QRCode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('QR code downloaded!');
      },
    );
  };

  const deleteEvent = async () => {
    try {
      setDeleting(true);
      await agent.RegistrationEvents.delete(event.id);
      removeEvent(event.id);
      toast.success('Event was deleted!');
    } catch (error: any) {
      console.log(error);
      if (error && error.message) {
        toast.error('An error occurred: ' + error.message);
      } else {
        toast.error('Delete failed!');
      }
    } finally {
      closeModal();
      setDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    const handleYesClick = () => {
      deleteEvent();
    };
    openModal(
      <Confirmation
        title={`Delete ${event.title}`}
        header={'Are You sure want to delete this event?'}
        subHeader={'deleting this event can not be undone.'}
        onYesClick={handleYesClick}
      />,
    );
  };

  return (
    <Card color="black">
      <CardContent>
        {event.published && (
          <Label as="a" color="green" ribbon>
            PUBLISHED
          </Label>
        )}
        <CardHeader textAlign="center" style={{ paddingBottom: '10px' }}>
          <h2>{event.title}</h2>
        </CardHeader>
        <CardMeta style={{ paddingBottom: '10px' }}>
          <Header as="h4" color="grey">
            <Icon name="map marker" />
            <HeaderContent>{event.location}</HeaderContent>
          </Header>
        </CardMeta>
        <CardMeta style={{ paddingBottom: '10px' }}>
          <Header as="h4" color="grey">
            <Icon name="calendar" />
            <HeaderContent>
              {new Date(event.startDate).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })}{' '}
              -{' '}
              {new Date(event.endDate).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })}
            </HeaderContent>
          </Header>
        </CardMeta>
        {event.published && !isMobile && (
          <CardMeta style={{ paddingBottom: '10px' }}>
            <Header as="h4" color="grey">
              <Icon name="paperclip" />
              <HeaderContent>
                <a
                  href={`${baseUrl}/registerforevent/${event.id}`}
                >{`${baseUrl}/registerforevent/${event.id}`}</a>
              </HeaderContent>
            </Header>
          </CardMeta>
        )}

        {event.published && (
          <CardMeta style={{ paddingBottom: '10px' }}>
            <Header as="h4" color="grey">
              <Icon name="user" />
              <HeaderContent>
                {event.registrations ? event.registrations.length : '0'}
                {event.registrations && event.registrations.length === 1
                  ? ' User'
                  : ' Users'}{' '}
                Registered
              </HeaderContent>
            </Header>
          </CardMeta>
        )}
        <CardDescription>{event.overview}</CardDescription>
      </CardContent>
      <CardContent extra>
        {event.published && (
          <ButtonGroup fluid>
            {event.registrations && event.registrations.length > 0 && (
              <Button
                basic
                color="brown"
                onClick={() => navigate(`/administerregistrants/${event.id}`)}
              >
                {isMobile ? (
                  <Icon name="users" size="large" />
                ) : (
                  'Manage Registrants'
                )}
              </Button>
            )}
            <Button
              basic
              color="green"
              onClick={() => navigate(`/editregistration/${event.id}`)}
            >
              {isMobile ? <Icon name="edit" size="large" /> : 'Edit'}
            </Button>
            <Button basic color="teal" onClick={copyLink}>
              {isMobile ? (
                <Icon name="copy" size="large" />
              ) : (
                'Copy Link to Clipboard'
              )}
            </Button>
            <Button basic color="orange" onClick={downloadQRCode}>
              {isMobile ? 'QR' : 'Create QR Code'}
            </Button>
            <Button
              basic
              color="red"
              onClick={handleDeleteClick}
              loading={deleting}
            >
              {isMobile ? <Icon name="trash" size="large" /> : 'Delete'}
            </Button>
          </ButtonGroup>
        )}
        {!event.published && (
          <ButtonGroup fluid>
            <Button
              basic
              color="green"
              onClick={() => navigate(`/editregistration/${event.id}`)}
            >
              {isMobile ? <Icon name="edit" size="large" /> : 'Edit'}
            </Button>
            <Button
              basic
              color="red"
              onClick={handleDeleteClick}
              loading={deleting}
            >
              {isMobile ? <Icon name="trash" size="large" /> : 'Delete'}
            </Button>
          </ButtonGroup>
        )}
      </CardContent>
    </Card>
  );
});
