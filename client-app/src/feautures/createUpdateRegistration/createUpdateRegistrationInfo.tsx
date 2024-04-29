import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw, Modifier  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";




const apiUrl = import.meta.env.VITE_API_URL;
interface Props{
  content: string
  setContent: (newContent : string) => void;
  setFormDirty: () => void;
}

function uploadImageCallBack(file : any) {
  return new Promise(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Ensure apiUrl is correctly defined somewhere in your code
      xhr.open('POST', `${apiUrl}/upload/uploadImage`);
      const data = new FormData();
      data.append('imageFile', file); // Match this key with your C# method parameter
      xhr.send(data); 
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        console.log(response);
        resolve(response);
      });
      xhr.addEventListener('error', () => {
        try {
          const error = JSON.parse(xhr.responseText);
          console.log(error);
          reject(error);
        } catch(e) {
          console.log('Error parsing JSON response', e);
          reject('An error occurred during the upload.');
        }
      });
    }
  );
}

export default observer (function CreateUpdateRegistrationInfo(
  {
    content, setContent, setFormDirty
  } : Props
){

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    if(content){
      setEditorState(
        EditorState.createWithContent(
          convertFromRaw(
            JSON.parse(content)
          )
        )
      );
    }
  }, []);

  const handleEditorChange = (newEditorState : EditorState) => {
    setFormDirty();
    setEditorState(newEditorState); 
    const contentAsString : string =  JSON.stringify(convertToRaw(newEditorState.getCurrentContent()));
    setContent(contentAsString);
  };

  const handlePastedText = (text :string, _html : string, editorState : EditorState) :boolean => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.replaceText(
      currentContent,
      selectionState,
      text, // Replace with just the text, no formatting
  );

  const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
  setEditorState(newEditorState);
  return true;
};


  return(
    <Editor 
                      editorState={editorState}
                      onEditorStateChange={handleEditorChange}
                      wrapperClassName="wrapper-class"
                      editorClassName="unique-editor-class"
                      toolbarClassName="toolbar-class"
                      handlePastedText={handlePastedText}
                      toolbar={{
                        image: { uploadCallback: uploadImageCallBack,
                           alt: { present: true, mandatory: false } },
                      }}
                    />
  )

})