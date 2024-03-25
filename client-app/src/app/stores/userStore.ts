import { makeAutoObservable, runInAction } from "mobx";
import { User } from "../models/user";
import agent from "../api/agent";
import { store } from "./store";
import { router } from "../router/Routes";
import { PublicClientApplication } from "@azure/msal-browser";
import { toast } from "react-toastify";
import { Providers } from '@microsoft/mgt-element';


export default class UserStore {
    user : User | null = null;
    loggingIn: boolean = false;

    logoutRequest = {
        postLogoutRedirectUri: "/", 
    };

    armyMsalConfig = {
        auth: {
           clientId: import.meta.env.VITE_CAC_CLIENT_ID,
           authority: `https://login.microsoftonline.com/${import.meta.env.VITE_CAC_TENANT_ID}`,
            redirectUri: import.meta.env.VITE_REDIRECT_ARMY_URI,
            navigateToLoginRequestUrl: true
        },
        cache: {
            cacheLocation: "sessionStorage", // This configures where your cache will be stored
            storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        },   
    };



  loginRequest = {
    scopes: ["User.Read"]
};
myMSALObj = new PublicClientApplication(this.armyMsalConfig);



    constructor() {
        makeAutoObservable(this);
        this.initialize();
    }

    async initialize() {
        await this.myMSALObj.initialize();

    }

    get isLoggedIn(){return !!this.user;}

    handleGraphRedirect = async () => {
        debugger;
        if (this.myMSALObj) {
            const response = await this.myMSALObj.handleRedirectPromise();
            if (response && !store.commonStore.donotautologin) {
                this.login(response.accessToken);
            }
        }
    };

    
    signInArmy = async() => {
        console.log('sign in army');
        try {
            await this.myMSALObj.loginRedirect(this.loginRequest);
        } catch (error) {
            toast.error('Error Logging into Army 365 - please login again', {
                position: "top-center",
                autoClose: 25000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            sessionStorage.clear(); 
            localStorage.clear();
            store.commonStore.setToken(null);
            this.user = null;
            router.navigate('/')
          console.log(error);
        }
    };



    login = async (token: string) => {
        this.loggingIn = true;
        try{
            const user = await agent.Account.login(token);
            store.commonStore.setToken(user.token);
            store.commonStore.setDoNotAutoLogin(null);
            runInAction(() => this.user = user);
            if (store.commonStore.redirectToPage){
                const redirectToPage = store.commonStore.redirectToPage;
                store.commonStore.setRedirectToPage(null);
                router.navigate(`/${redirectToPage}`);
            }else{
                router.navigate('/myregistrations')  
            }
        } catch (error){
            sessionStorage.clear(); 
            localStorage.clear();
            store.commonStore.setToken(null);
            store.commonStore.setDoNotAutoLogin('true');
            this.user = null;
            console.log(error);
            router.navigate('/loginerror')
     }finally{
        this.loggingIn = false;
     }
    }



    logout = () => {
        sessionStorage.clear(); 
        localStorage.clear();
        store.commonStore.setToken(null);
        store.commonStore.setDoNotAutoLogin('true');
        store.commonStore.setLoginType(null);
        this.user = null;
        if (this.myMSALObj) {
            this.myMSALObj.logoutRedirect(this.logoutRequest);
        }else{
            router.navigate('/')
        }

    }

    getUser = async () => {
        debugger;
        try{
      const user =   await agent.Account.current();
        runInAction(() => this.user = user);
        } catch (error){
            sessionStorage.clear(); 
            localStorage.clear();
            store.commonStore.setToken(null);
            store.commonStore.setDoNotAutoLogin('true');
            this.user = null;
            router.navigate('/')
          console.log(error);
        }
    }


}