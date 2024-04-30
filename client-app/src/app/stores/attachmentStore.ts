import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { store } from "./store";
import { toast } from "react-toastify";

export default class AttachmentStore {
    uploading = false;

    constructor() {
        makeAutoObservable(this);
      }

      setUploadingOn = () => this.uploading = true;
      setUploadingOff = () => this.uploading = false;

      uploadAnswerDocument = async (file: any, answerAttachmentId: string, customQuestionId : string, registrationId: string ) => {
        this.uploading = true;
        try{
          const response = await agent.Uploads.uploadAnswerAttachment(file, answerAttachmentId, customQuestionId, registrationId );
          runInAction(() => {
            this.uploading = false;
            store.modalStore.closeModal();
          })
        } catch(error){
          console.log(error);
          runInAction(() => {
            this.uploading = false;
            toast.error('an error occured trying to upload your file')
            store.modalStore.closeModal();

          })
        }
      }

      uploadDocumentLibraryDocument = async (file: any, answerAttachmentId: string, registrationId: string) => {
        try {
            const response = await agent.Uploads.uploadDocumentLibraryAttachment(file, answerAttachmentId, registrationId);
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.uploading = false;
                toast.error('an error occured trying to upload your file');
                store.modalStore.closeModal(); 
            });
        }
    }
    
}