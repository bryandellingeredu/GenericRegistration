import { Button, Grid, Header, Icon } from "semantic-ui-react";
import DocumentUploadWidgetDropzone from "./documentUploadWidgetDropzone";
import {useState} from 'react'

interface Props{
    loading: boolean;
    uploadDocument: (file: any, questionId : string) => void
    color: string;
    questionId: string;
}



export default function DocumentUploadWidget({loading, uploadDocument,color, questionId}: Props){
    const [files, setFiles] = useState<any>([]);

    const handleUploadDocument = () => {
          debugger;
          uploadDocument(files[0], questionId);
      };

    return (
        <Grid>
            <Grid.Row>
            <Grid.Column width={4}>
                <Header sub style={{color: color}} content='Step 1 - Add Document' textAlign="center" />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub style={{color: color}} content='Document' textAlign="center" />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub style={{color: color}} content='Step 2 - Upload Document' textAlign="center" />
            </Grid.Column>
            </Grid.Row>
            <Grid.Row>
            <Grid.Column width={4}>
                   <DocumentUploadWidgetDropzone setFiles={setFiles} />
            </Grid.Column>
            
            <Grid.Column width={1} />
            <Grid.Column width={4} >
                   {files && files.length > 0 && (
                    <div style={{marginTop: '20px'}}>
                     <Header as='h2' icon style={{color: color}} textAlign='center'>
                     <Icon name='file' />
                     {files[0].name.length > 20 ? files[0].name.substring(0, 17) + '...' : files[0].name}                 
                   </Header>
                   </div>
                   )
                   }
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4} textAlign='center'>
            {files && files.length > 0 && (
            <div style={{marginTop: '60px'}}>
            <Button type='button' icon labelPosition='left' primary onClick = {handleUploadDocument}  loading={loading} >
          
      <Icon name='upload' />
      Upload
    </Button>
    </div>
    )}
            </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}