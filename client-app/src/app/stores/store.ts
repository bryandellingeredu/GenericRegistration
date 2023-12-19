import { createContext, useContext } from "react";
import RegistrationStore from "./registrationStore";
import UserStore from "./userStore";
import CommonStore from "./commonStore";

interface Store {
    registrationStore: RegistrationStore
    userStore: UserStore
    commonStore: CommonStore
}

export const store: Store = {
    registrationStore: new RegistrationStore(),
    userStore: new UserStore(),
    commonStore: new CommonStore()
}

export const StoreContext = createContext(store)

export function useStore(){
    return useContext(StoreContext);
}