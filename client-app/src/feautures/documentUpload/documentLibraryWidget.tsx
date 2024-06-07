import { Grid, Header, Icon } from 'semantic-ui-react';
import { useState, useRef } from 'react';
import DocumentLibraryUploadWidgetDropzone from './documentLibraryUploadWidgetDropzone';

interface Props {
  uploadDocuments: (file: File[], registrationEventId: string) => void;
  registrationEventId: string;
}

export default function DocumentLibraryWidget({
  uploadDocuments,
  registrationEventId,
}: Props) {
  const [files, setFiles] = useState<any>([]);
  const uploadInitiated = useRef<boolean>(false);

  const onFileAdded = (selectedFiles: any[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0 && !uploadInitiated.current) {
      uploadDocuments(selectedFiles, registrationEventId);
      uploadInitiated.current = true;
    }
  };

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <DocumentLibraryUploadWidgetDropzone
            setFiles={onFileAdded}
            error={false}
          />
          {files.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Header as="h2" icon style={{ color: 'black' }}>
                <Icon name="file" />
                {files[0].name.length > 20
                  ? files[0].name.substring(0, 17) + '...'
                  : files[0].name}
              </Header>
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
