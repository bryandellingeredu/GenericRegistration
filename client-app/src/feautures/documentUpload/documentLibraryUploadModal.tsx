import { Button, Divider, Header, Icon } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import DocumentLibraryWidget from "./documentLibraryWidget";

interface Props{
    uploadDocuments: (files: File[], registrationEventId: string) => void;
    registrationEventId: string,
}

export default function DocumentLibraryUploadModal(
    {uploadDocuments, registrationEventId} : Props){
        const { modalStore } = useStore();
        const {closeModal} = modalStore;
        return(
        <>
           <Button
            floated="right"
            icon
            size="mini"
            color="black"
            compact
            onClick={() => closeModal()}
          >
                        <Icon name='x' />
          </Button>

        <Divider horizontal>
            <Header as="h2">
                <Icon name='paperclip' />     
              Add Documents
            </Header>
            <Header.Subheader>
            Upload your files by dragging and dropping them into the area below or click to browse.
        </Header.Subheader>
          </Divider>

          <DocumentLibraryWidget
           uploadDocuments={uploadDocuments}
           registrationEventId={registrationEventId}
           />
        </>
        )
    }