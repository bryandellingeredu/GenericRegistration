import { makeAutoObservable, runInAction } from "mobx";
import { User } from "../models/user";
import agent from "../api/agent";
import { store } from "./store";
import { router } from "../router/Routes";
import { PublicClientApplication } from "@azure/msal-browser";
import { toast } from "react-toastify";


export default class UserStore {
    user : User | null = null;

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
    get isLoggedIn(){
        return !!this.user;
    }

    handleGraphRedirect = async () => {
        if (this.myMSALObj) {
            const response = await this.myMSALObj.handleRedirectPromise();
            if (response) {
                await store.userStore.login(response.accessToken);
            }
        }
    };

    
    signInArmy = async() => {
        console.log('sign in army');
        try {
            await this.myMSALObj.loginRedirect(this.loginRequest);
            // The response will be handled after the redirect
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
            console.log(error);
        }
    };

    login = async (token: string) => {
            debugger;
            const user = await agent.Account.login(token);
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            router.navigate('/createRegistrationForm')
    }

    logout = () => {
        store.commonStore.setToken(null);
        localStorage.removeItem('jwtregistration');
        this.user = null;
        router.navigate('/')
    }


}