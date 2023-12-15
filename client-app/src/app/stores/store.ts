import { createContext, useContext } from "react";
import RegistrationStore from "./registrationStore";

interface Store {
    registrationStore: RegistrationStore
}

export const store: Store = {
    registrationStore: new RegistrationStore()
}

export const StoreContext = createContext(store)

export function useStore(){
    return useContext(StoreContext);
}