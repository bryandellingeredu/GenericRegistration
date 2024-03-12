import { makeAutoObservable, reaction } from "mobx";

export default class CommonStore {

    token: string | null = localStorage.getItem('jwtregistration');
    donotautologin : string | null = localStorage.getItem('donotautologin');
    redirectToPage : string | null = localStorage.getItem('redirectToPage');

    appLoaded = false;

    constructor() {
        makeAutoObservable(this);
        reaction(
            () => this.token,
            (newToken) => { 
                if(newToken){
                    localStorage.setItem('jwtregistration', newToken);
                } else {
                    localStorage.removeItem('jwtregistration');
                }
            }
        )
        
        reaction(
            () => this.donotautologin,
            (newDoNotAutoLogin) => { 
                if(newDoNotAutoLogin){
                    localStorage.setItem('donotautologin', newDoNotAutoLogin);
                } else {
                    localStorage.removeItem('donotautologin');
                }
            }
        )

        reaction(
            () => this.redirectToPage,
            (newRedirectToPage) => { 
                if(newRedirectToPage){
                    localStorage.setItem('redirectToPage', newRedirectToPage);
                } else {
                    localStorage.removeItem('redirectToPage');
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

    setRedirectToPage = (redirectToPage: string | null) => {
        this.redirectToPage = redirectToPage
    }
}