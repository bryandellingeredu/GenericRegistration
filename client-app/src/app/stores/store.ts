import { createContext, useContext } from "react";
import RegistrationStore from "./registrationStore";
import UserStore from "./userStore";
import CommonStore from "./commonStore";
import ModalStore from "./modalStore";
import ResponsiveStore from "./responsiveStore";

interface Store {
    registrationStore: RegistrationStore
    userStore: UserStore
    commonStore: CommonStore
    modalStore: ModalStore
    responsiveStore: ResponsiveStore
}

export const store: Store = {
    registrationStore: new RegistrationStore(),
    userStore: new UserStore(),
    commonStore: new CommonStore(),
    modalStore: new ModalStore(),
    responsiveStore: new ResponsiveStore()
}

export const StoreContext = createContext(store)

export function useStore(){
    return useContext(StoreContext);
}