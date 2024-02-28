import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw  } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface Props{
  content: string
  setContent: (newContent : string) => void;
  setFormDirty: () => void;
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
                    />
  )

})