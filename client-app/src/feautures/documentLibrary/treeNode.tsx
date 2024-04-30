import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Tree from './tree';
import { Node } from '../../app/models/Node';
import { Button, ButtonContent, ButtonGroup, Header, HeaderContent, Icon, Input } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleDown, faArrowAltCircleUp, faArrowUp, faDownload, faEdit, faFileArrowDown, faFileArrowUp, faFileCircleMinus, faFileCirclePlus, faFolderClosed, faFolderMinus, faFolderOpen, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '../../app/stores/store';
import Confirmation from '../../app/common/modals/Confirmation';
import DocumentLibraryUploadModal from '../documentUpload/documentLibraryUploadModal';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { AnswerAttachment } from '../../app/models/answerAttachment';
import agent from '../../app/api/agent';

const apiUrl = import.meta.env.VITE_API_URL;

interface Props{ 
    node: Node,
    registrationEventId: string
}

export default observer(function TreeNode({node, registrationEventId} : Props) {
    const {documentLibraryStore, modalStore, attachmentStore, commonStore} = useStore();
      const {token} = commonStore;
    const {openModal, closeModal} = modalStore;
    const {edit, addFolder, deleteNode, addFile, moveNode} = documentLibraryStore;
    const {uploadDocumentLibraryDocument, setUploadingOn, setUploadingOff}  = attachmentStore
    const { children, label, key } = node;
    const [downloading, setDownloading] = useState(false);
    const [showChildren, setShowChildren] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(label);

    const handleClick = () => setShowChildren(!showChildren);
    const handleEdit = () => setIsEditing(true);
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditLabel(e.target.value);
    const handleSave = () => {
        edit(registrationEventId,node.key, editLabel); 
        setIsEditing(false);
    };

    const handleAddFolder = () => {
        if(!showChildren) setShowChildren(!showChildren);
        addFolder(registrationEventId, node.key);
    }

    const handleCancel = () => {
        setIsEditing(false);
        setEditLabel(label); // Reset the label if cancelled
    };

    const deleteFolder = () => {
        deleteNode(registrationEventId, node.key);
        closeModal();
    }

    const deleteFile = () => {
        deleteNode(registrationEventId, node.key);
        closeModal();
    }

    const handleMoveNodeUp = () =>{
        moveNode(registrationEventId, node.key, 'up');
    }

    const handleMoveNodeDown = () =>{
        moveNode(registrationEventId, node.key, 'down');
    }

    const  handleDeleteFolderClick = () => {
        const handleYesClick = () => { deleteFolder()}
        openModal(<Confirmation
            title={`Delete ${node.label} Folder`}
            header={'Are You sure want to delete this folder?'} 
            subHeader={'deleting this folder can not be undone.'}
            onYesClick={handleYesClick }/>) 
    }

    const  handleDeleteFileClick = () => {
        const handleYesClick = () => { deleteFile()}
        openModal(<Confirmation
            title={`Delete ${node.label} `}
            header={'Are You sure want to delete this file?'} 
            subHeader={'deleting this file can not be undone.'}
            onYesClick={handleYesClick }/>) 
    }

    async function handleUpload(files: File[], registrationEventId: string, ) {
        setUploadingOn();
        
        await Promise.all(files.map(file => {
            const answerAttachmentId = uuidv4();
            const fileName = file.name;
    
       
            addFile(registrationEventId, node.key, answerAttachmentId, fileName);
    
      
            return uploadDocumentLibraryDocument(file, answerAttachmentId, registrationEventId)
                .catch(error => {
                    console.error(`Error uploading file: ${fileName}`, error);
                    toast.error(`Error uploading file ${fileName}`);
                });
        }));
    
        setUploadingOff(); 
        closeModal(); 
    }

    const downloadAttachment = async () => {
        setDownloading(true)
          try {
            const answerAttachment : AnswerAttachment = await agent.AnswerAttachments.details(node.key)

            const headers = new Headers();
            headers.append("Authorization", `Bearer ${token}`);
      
            const requestOptions = {
              method: "GET",
              headers: headers,
            };
            
            const attachmentData = await fetch(`${apiUrl}/upload/${answerAttachment.id}`, requestOptions);
            
            if (!attachmentData.ok) {
              throw new Error('Network response was not ok.');
            }
      
            const data = await attachmentData.arrayBuffer();
            const file = new Blob([data], { type: answerAttachment.fileType });
            const fileUrl = window.URL.createObjectURL(file);
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = node.label;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(fileUrl);
          } catch (err) {
            console.error(err);
          }finally{
            setDownloading(false);
          }
        
      };

    return(
        <>
    
       <Header as={children ? 'h2' : 'h3'} >
       {!showChildren &&  children && <Icon name='folder outline' onClick={handleClick} /> }
       {showChildren && children && <Icon name='folder open outline' onClick={handleClick} /> }
       {!children && <Icon name='file' /> }
        <HeaderContent>
        {isEditing ? (
                        <Input 
                            value={editLabel} 
                            onChange={handleLabelChange}
                            onBlur={handleSave} // Save on losing focus
                            autoFocus
                        />
                    ) : (
            <span onClick={handleClick}>{label }</span>
        )}
        {children && 
        <ButtonGroup size='tiny' style={{marginLeft: '10px'}}>
        <Button basic color='blue' animated='vertical' onClick={handleClick}>
        <ButtonContent hidden>{showChildren ? 'Close Folder' : 'Open Folder'}</ButtonContent>
        <ButtonContent visible>
        {!showChildren && <FontAwesomeIcon icon={faFolderOpen} size='2x' />}
        { showChildren && <FontAwesomeIcon icon={faFolderClosed} size='2x' />}
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleEdit}>
        <ButtonContent hidden>rename folder</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faEdit} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' 
         onClick={() =>
            openModal(
              <DocumentLibraryUploadModal
              registrationEventId={registrationEventId}
              uploadDocuments={handleUpload}
              />
            )
          }
        >
        <ButtonContent hidden>upload files</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFileCirclePlus} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleAddFolder}>
        <ButtonContent hidden>new folder</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFolderPlus} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleMoveNodeUp}>
        <ButtonContent hidden>move up</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faArrowAltCircleUp} size='2x'  />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleMoveNodeDown}>
        <ButtonContent hidden>move down</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faArrowAltCircleDown} size='2x'  />
        </ButtonContent>
        </Button>
        <Button basic color='red' animated='vertical' onClick={handleDeleteFolderClick}>
        <ButtonContent hidden>delete folder</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFolderMinus} size='2x' />
        </ButtonContent>
        </Button>
        </ButtonGroup>
        }
        {!children &&
        <ButtonGroup size='tiny' style={{marginLeft: '10px'}}>
        <Button basic color='blue' animated='vertical' onClick={downloadAttachment} loading={downloading}>
            <ButtonContent hidden>download</ButtonContent>
            <ButtonContent visible>
                <FontAwesomeIcon icon={faDownload} size='2x'  />
            </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleEdit}>
        <ButtonContent hidden>rename file</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faEdit} size='2x'  />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleMoveNodeUp}>
        <ButtonContent hidden>move up</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faArrowAltCircleUp} size='2x'  />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleMoveNodeDown}>
        <ButtonContent hidden>move down</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faArrowAltCircleDown} size='2x'  />
        </ButtonContent>
        </Button>
        <Button basic color='red' animated='vertical' onClick={handleDeleteFileClick}>
        <ButtonContent hidden>delete file </ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFileCircleMinus} size='2x' />
        </ButtonContent>
        </Button>
        </ButtonGroup>
        }
        </HeaderContent>
      </Header>

      <ul style={{ paddingLeft: "10px", borderLeft: "1px solid black" }}>
        {showChildren && children && 
         <Tree
          treeData={children} 
          registrationEventId={registrationEventId}  
         />}
      </ul>
        </>
    )
});
