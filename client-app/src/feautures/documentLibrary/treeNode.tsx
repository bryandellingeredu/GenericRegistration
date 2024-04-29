import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import Tree from './tree';
import { Node } from '../../app/models/Node';
import { Button, ButtonContent, ButtonGroup, Header, HeaderContent, Icon, Input } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFileCirclePlus, faFolderClosed, faFolderMinus, faFolderOpen, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '../../app/stores/store';
import Confirmation from '../../app/common/modals/Confirmation';


interface Props{ 
    node: Node,
    registrationEventId: string
}

export default observer(function TreeNode({node, registrationEventId} : Props) {
    const {documentLibraryStore, modalStore} = useStore();
    const {openModal, closeModal} = modalStore;
    const {edit, addFolder, deleteNode} = documentLibraryStore;
    const { children, label, key } = node;
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

    const  handleDeleteFolderClick = () => {
        const handleYesClick = () => { deleteFolder()}
        openModal(<Confirmation
            title={`Delete ${node.label} Folder`}
            header={'Are You sure want to delete this folder?'} 
            subHeader={'deleting this folder can not be undone.'}
            onYesClick={handleYesClick }/>) 
    }

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
        <ButtonContent hidden>rename</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faEdit} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical' onClick={handleAddFolder}>
        <ButtonContent hidden>New Folder</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFolderPlus} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='blue' animated='vertical'>
        <ButtonContent hidden>New File</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFileCirclePlus} size='2x' />
        </ButtonContent>
        </Button>
        <Button basic color='red' animated='vertical' onClick={handleDeleteFolderClick}>
        <ButtonContent hidden>Delete Folder</ButtonContent>
        <ButtonContent visible>
        <FontAwesomeIcon icon={faFolderMinus} size='2x' />
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
