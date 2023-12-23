import { makeAutoObservable, reaction } from "mobx";

export default class CommonStore {

    token: string | null = localStorage.getItem('jwtregistration');
    donotautologin : string | null = localStorage.getItem('donotautologin');

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
        
        reaction(
            () => this.donotautologin,
            (newDoNotAutoLogin) => { // Changed from 'donotautologin' to 'newDoNotAutoLogin'
                if(newDoNotAutoLogin){
                    localStorage.setItem('donotautologin', newDoNotAutoLogin);
                } else {
                    localStorage.removeItem('donotautologin');
                }
            }
        )
  
    }

    setToken = (token: string | null) => {
        this.token = token;
    }

    
    setDoNotAutoLogin = (donotautologin: string | null) => {
        this.donotautologin = donotautologin;
    }


    setAppLoaded = () =>{
        this.appLoaded = true;
    }
}