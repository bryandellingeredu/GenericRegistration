import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Dimmer, Header, Icon, Loader, Segment } from 'semantic-ui-react';
import { useStore } from '../../app/stores/store';

interface Props {
  setFiles: (files: any) => void;
  error: boolean;
}

export default function DocumentLibraryUploadWidgetDropzone({
  setFiles,
  error,
}: Props) {
  const { attachmentStore } = useStore();
  const { uploading } = attachmentStore;

  const dzStyles = {
    border: 'dashed 3px #eee',
    borderColor: error ? 'red' : '#eee',
    borderRadius: '5px',
    paddingTop: '30px',
    textAlign: 'center' as 'center',
    height: '200px',
  };

  const dzActive = {
    borderColor: 'green',
  };

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
    [setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      {uploading && (
        <Dimmer active>
          <Loader>Uploading Files</Loader>
        </Dimmer>
      )}

      <div
        {...getRootProps()}
        style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}
      >
        <input {...getInputProps()} />
        <Icon
          name="hand point down"
          size="huge"
          color={error ? 'red' : 'black'}
        />
        <Header
          content="Drag And Drop Multiple Files at Once, Or Click To Browse"
          color={error ? 'red' : 'black'}
        />
      </div>
    </>
  );
}
