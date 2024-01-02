import { makeAutoObservable, reaction } from "mobx";

export default class CommonStore {

    token: string | null = localStorage.getItem('jwtregistration');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);
        reaction(
            () => this.token,
            (newToken) => { // Changed from 'token' to 'newToken'
                if(newToken){
                    localStorage.setItem('jwtregistration', newToken);
                } else {
                    localStorage.removeItem('jwtregistration');
                }
            }
        )
  
    }

    setToken = (token: string | null) => {
        this.token = token;
    }



    setAppLoaded = () =>{
        this.appLoaded = true;
    }
}