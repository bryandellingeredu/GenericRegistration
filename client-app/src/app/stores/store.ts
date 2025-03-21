import { createContext, useContext } from 'react';
import RegistrationStore from './registrationStore';
import UserStore from './userStore';
import CommonStore from './commonStore';
import ModalStore from './modalStore';
import ResponsiveStore from './responsiveStore';
import AttachmentStore from './attachmentStore';
import DocumentLibraryStore from './documentLibraryStore';

interface Store {
  registrationStore: RegistrationStore;
  userStore: UserStore;
  commonStore: CommonStore;
  modalStore: ModalStore;
  responsiveStore: ResponsiveStore;
  attachmentStore: AttachmentStore;
  documentLibraryStore: DocumentLibraryStore;
}

export const store: Store = {
  registrationStore: new RegistrationStore(),
  userStore: new UserStore(),
  commonStore: new CommonStore(),
  modalStore: new ModalStore(),
  responsiveStore: new ResponsiveStore(),
  attachmentStore: new AttachmentStore(),
  documentLibraryStore: new DocumentLibraryStore(),
};

export const StoreContext = createContext(store);

export function useStore() {
  return useContext(StoreContext);
}
