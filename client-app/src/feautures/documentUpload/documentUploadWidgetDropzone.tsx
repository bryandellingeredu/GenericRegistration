import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Header, Icon } from 'semantic-ui-react';

interface Props {
  setFiles: (files: any) => void;
  error: boolean;
}

export default function DocumentUploadWidgetDropzone({
  setFiles,
  error,
}: Props) {
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
      if (acceptedFiles.length > 1) {
        toast.error('You may only upload one attachment at a time.', {
          position: 'top-center',
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        setFiles(
          acceptedFiles.map((file: any) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          ),
        );
      }
    },
    [setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
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
        content="Drag And Drop, Or Click To Browse"
        color={error ? 'red' : 'black'}
      />
    </div>
  );
}
