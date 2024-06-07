import { Button, ButtonGroup, Grid, Header, Icon } from 'semantic-ui-react';
import HeaderSubHeader from 'semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader';
import CreateUpdateRegistrationInfo from './createUpdateRegistrationInfo';
import Tree from '../documentLibrary/tree';
import { Node } from '../../app/models/Node';
import { toast } from 'react-toastify';

interface Props {
  documentLibraryContent: string;
  formisDirty: boolean;
  setContent: (newContent: string) => void;
  setFormDirty: () => void;
  savingFromStepClick: boolean;
  treeData: Node[];
  registrationEventId: string;
  saving: boolean;
  saveForm: () => void;
}
export default function DocumentStep({
  documentLibraryContent,
  formisDirty,
  setContent,
  setFormDirty,
  savingFromStepClick,
  treeData,
  registrationEventId,
  saving,
  saveForm,
}: Props) {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const copyLink = () => {
    const websiteUrl = `${baseUrl}/documentlibraryforevent/${registrationEventId}`;
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

  return (
    <>
      <Header as={'h2'} textAlign="center">
        Optional Document Library Creation
        <HeaderSubHeader>
          Create content and upload documents for registered participants to use
          during the event
        </HeaderSubHeader>
      </Header>
      <Grid stackable style={{ marginTop: '20px', padding: '40px' }}>
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as="h2" textAlign="center">
              <Icon name="info" />
              <Header.Content>
                Document Library Instructions
                <Header.Subheader>
                  Create a description and instructions for your document
                  library.
                </Header.Subheader>
              </Header.Content>
            </Header>
            <CreateUpdateRegistrationInfo
              content={documentLibraryContent}
              setContent={setContent}
              setFormDirty={setFormDirty}
            />
            {formisDirty && !savingFromStepClick && (
              <Button
                floated="right"
                color="blue"
                basic
                size="huge"
                loading={saving}
                onClick={saveForm}
                style={{ marginTop: '10px' }}
              >
                {' '}
                Save Pending Changes
              </Button>
            )}
          </Grid.Column>
          <Grid.Column width={8}>
            <Header as="h2" textAlign="center">
              <Icon name="book" />
              <Header.Content>
                Document Library
                <Header.Subheader>
                  Upload documents into folders and subfolders
                </Header.Subheader>
              </Header.Content>
            </Header>
            <Tree
              treeData={treeData}
              registrationEventId={registrationEventId}
              isAdmin={true}
            />
            <ButtonGroup
              size="huge"
              floated="right"
              style={{ marginRight: '40px' }}
            >
              <Button
                primary
                content="Copy Docment Library Link to Clipboard"
                floated="right"
                onClick={copyLink}
              />
            </ButtonGroup>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}
