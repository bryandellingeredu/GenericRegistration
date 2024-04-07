import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import agent from '../../app/api/agent';

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
      xhr.open('POST', 'https://api.imgur.com/3/image');
      xhr.setRequestHeader('Authorization', 'Client-ID 01f2bf93d2b54b1');
      const data = new FormData();
      data.append('image', file);
      debugger;
      xhr.send(data); 
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        console.log(response)
        resolve(response);
      });
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        console.log(error);
        reject(error);
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



  return(
    <Editor 
                      editorState={editorState}
                      onEditorStateChange={handleEditorChange}
                      wrapperClassName="wrapper-class"
                      editorClassName="unique-editor-class"
                      toolbarClassName="toolbar-class"
                      toolbar={{
                        image: { uploadCallback: uploadImageCallBack,
                           alt: { present: true, mandatory: false } },
                      }}
                    />
  )

})