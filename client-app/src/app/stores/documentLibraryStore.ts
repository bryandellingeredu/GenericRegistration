import { makeAutoObservable,runInAction } from "mobx";
import { Node } from "../models/Node";
import { v4 as uuidv4 } from 'uuid';
import agent from "../api/agent";
import { toast } from "react-toastify";
import { store } from "./store";

const defaultTreeData  = [
  {
    key: uuidv4(),
    label: "Documents",
    children: []
  }];

export default class DocumentLibraryStore {
    TreeDataRegistry = new Map<string, Node[]>();


    get treeData() {
      return Array.from(this.TreeDataRegistry.values());
    }

    constructor() {
        makeAutoObservable(this);
      }


      saveToDB = async(registrationEventId: string, treeData: Node[]) =>{
       if(store.userStore.user){
        try{
            await agent.RegistrationEventDocumentLibraries.createUpdate(registrationEventId, JSON.stringify(treeData))
        } catch (error) {
          toast.error('Error Saving to Database', {
              position: "top-center",
              autoClose: 25000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
          });
          console.log(error);
        }
       }
      }

      addTreeData = (registrationEventId: string, treeData: Node[]) => {
        this.TreeDataRegistry.set(registrationEventId, treeData);
        this.saveToDB(registrationEventId, treeData);
      }

      getTreeData = (id: string) => {
        let treeData = this.TreeDataRegistry.get(id);
        if (treeData) {
            return treeData;  // Immediately return existing data if available
        }
    
        // Trigger asynchronous operation to fetch and update data if not found
        this.fetchAndStoreTreeData(id);
    }

    fetchAndStoreTreeData = async (id: string) => {
      try {
          const response = await agent.RegistrationEventDocumentLibraries.details(id);
          if (response && response.treeData) {
              const parsedData = JSON.parse(response.treeData);
              runInAction(() => {
                  this.addTreeData(id, parsedData && parsedData.length > 0 ? parsedData : defaultTreeData);
              });
          } else {
              runInAction(() => {
                  this.addTreeData(id, defaultTreeData);
              });
          }
      } catch (error) {
          console.error("Failed to fetch tree data:", error);
          toast.error('Error fetching tree data');
      }
  }



       edit = (registrationEventId: string, key: string, newLabel: string) => {
        const treeData = this.getTreeData(registrationEventId);
        if (treeData) {  // Check if treeData is not undefined
            const updateNodeLabel = (nodes: Node[]): boolean => {
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].key === key) {
                        nodes[i].label = newLabel; // Update the label
                        return true; // Node found and updated
                    }
                    if (nodes[i].children && updateNodeLabel(nodes[i].children!)) {
                        return true; // Node found and updated in children
                    }
                }
                return false; // Node not found
            };

            const updated = updateNodeLabel(treeData);
            if (updated) {
                this.TreeDataRegistry.set(registrationEventId, treeData);
                this.saveToDB(registrationEventId, treeData);
            }
        }
    }

    addFolder = (registrationEventId: string, parentKey: string) => {
        const treeData = this.getTreeData(registrationEventId);
        if (treeData) {
            const addNewFolder = (nodes: Node[]): boolean => {
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].key === parentKey) {
                        const newFolder: Node = {
                            key: uuidv4(),  // Unique key for the new folder
                            label: "New Folder",
                            children: []
                        };
                        if (!nodes[i].children) {
                            nodes[i].children = [];  // Initialize children if undefined
                        }
                        nodes[i].children!.push(newFolder);
                        return true;
                    }
                    if (nodes[i].children && addNewFolder(nodes[i].children!)) {
                        return true;
                    }
                }
                return false;
            };

            if (addNewFolder(treeData)) {
                this.TreeDataRegistry.set(registrationEventId, treeData);
                this.saveToDB(registrationEventId, treeData);
            }
        }
    }

    addFile = (registrationEventId: string, parentKey: string, answerAttachmentId: string, fileName: string) => {
      const treeData = this.getTreeData(registrationEventId);
      if (treeData) {
          const addNewFile = (nodes: Node[]): boolean => {
              for (let i = 0; i < nodes.length; i++) {
                  if (nodes[i].key === parentKey) {
                      const newFile: Node = {
                          key: answerAttachmentId,  
                          label: fileName,
                      };
                      if (!nodes[i].children) {
                        nodes[i].children = [];  // Initialize children if undefined
                    }
                      nodes[i].children!.push(newFile);
                      return true;
                  }
                  if (nodes[i].children && addNewFile(nodes[i].children!)) {
                      return true;
                  }
              }
              return false;
          };

          if (addNewFile(treeData)) {
              this.TreeDataRegistry.set(registrationEventId, treeData);
              this.saveToDB(registrationEventId, treeData);
          }
      }
  }

    deleteNode = (registrationEventId: string, targetKey: string) => {
      const treeData = this.getTreeData(registrationEventId);
      if (treeData) {
          const deleteTheNode = (nodes: Node[]): boolean => {
              for (let i = 0; i < nodes.length; i++) {
                  if (nodes[i].key === targetKey) {
                      nodes.splice(i, 1);
                      return true;
                  }
                  if (nodes[i].children && deleteTheNode(nodes[i].children!)) {
                      return true;
                  }
              }
              return false; 
          };

          if (deleteTheNode(treeData)) {
              this.TreeDataRegistry.set(registrationEventId, treeData);
              if(!treeData || treeData.length < 1){
             
                  this.TreeDataRegistry.set(registrationEventId, defaultTreeData);
              }  
              this.saveToDB(registrationEventId, treeData); 
          }
      }
  }

  moveNode = (registrationEventId: string, targetKey: string, direction: 'up' | 'down') => {
    const treeData = this.getTreeData(registrationEventId);
    if (!treeData) return;

    const moveNodeInArray = (nodes: Node[], key: string, dir: 'up' | 'down'): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].key === key) {
                if (dir === 'up' && i > 0) {
                    // Swap the current node with the previous one
                    [nodes[i - 1], nodes[i]] = [nodes[i], nodes[i - 1]];
                    return true;
                } else if (dir === 'down' && i < nodes.length - 1) {
                    // Swap the current node with the next one
                    [nodes[i + 1], nodes[i]] = [nodes[i], nodes[i + 1]];
                    return true;
                }
                return false; // Node found but no move made (out of bounds)
            }
            // Recursively look for the node in children
            if (nodes[i].children && moveNodeInArray(nodes[i].children!, key, dir)) {
                return true;
            }
        }
        return false; // Node not found in this branch
    };

    // Execute the move operation
    const moved = moveNodeInArray(treeData, targetKey, direction);
    if (moved) {
        runInAction(() => {
            this.TreeDataRegistry.set(registrationEventId, treeData);
            this.saveToDB(registrationEventId, treeData);
        });
    }
}

}