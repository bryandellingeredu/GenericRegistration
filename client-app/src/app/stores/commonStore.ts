import { makeAutoObservable, reaction } from "mobx";

export default class CommonStore {

    token: string | null = localStorage.getItem('jwtregistration');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);
        reaction(
            () => this.token,
            token =>{
                if(token){
                    localStorage.setItem('jwtregistration',token);
                }else{
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