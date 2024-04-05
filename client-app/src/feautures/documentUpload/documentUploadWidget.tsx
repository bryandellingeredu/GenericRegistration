import { Grid, Header, Icon } from "semantic-ui-react";
import DocumentUploadWidgetDropzone from "./documentUploadWidgetDropzone";
import { useState, useRef } from 'react';

interface Props {
  loading: boolean;
  uploadDocument: (file: any, questionId: string) => void;
  color: string;
  questionId: string;
  error: boolean;
}

export default function DocumentUploadWidget({ loading, uploadDocument, color, questionId, error }: Props) {
  const [files, setFiles] = useState<any>([]);
  const uploadInitiated = useRef<boolean>(false);

  // Function to handle file selection
  const onFileAdded = (selectedFiles: any[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0 && !uploadInitiated.current) {
      uploadDocument(selectedFiles[0], questionId);
      uploadInitiated.current = true; // Mark that upload has been initiated to prevent duplicate uploads
    }
  };

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <DocumentUploadWidgetDropzone setFiles={onFileAdded} error={error}/>
          {files.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Header as='h2' icon style={{ color: color }}>
                <Icon name='file' />
                {files[0].name.length > 20 ? files[0].name.substring(0, 17) + '...' : files[0].name}
              </Header>
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
