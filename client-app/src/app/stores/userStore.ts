import { UserManager } from 'oidc-client';
import { makeAutoObservable, runInAction} from 'mobx';
import { store } from './store';
import { router } from '../router/Routes';
import { User } from '../models/user';
import { JwtPayload, jwtDecode } from 'jwt-decode';


interface MyTokenPayload extends JwtPayload {
    email?: string;
    preferred_username?: string;
    name?: string;
}

export default class UserStore {
    user: User | null = null;

    userManager = new UserManager({
        authority: 'https://localhost:7014', // IdentityServer URL
        client_id: 'react_client', // Client ID
        redirect_uri: 'http://localhost:3000/registration/callback', // Redirect URI after login
        response_type: "code",
        scope: 'openid profile movieAPI',
        post_logout_redirect_uri: 'http://localhost:3000/registration', // Redirect URI after logout
    });

    constructor() {
        makeAutoObservable(this);
        this.userManager.events.addUserLoaded(this.onUserLoaded);
        this.userManager.events.addUserUnloaded(this.onUserUnloaded);
    }

    onUserLoaded = (oidcUser : any) => {
        debugger;
        store.commonStore.setToken(oidcUser.access_token);
        this.user = {
            mail: oidcUser.profile.email || '',
            userName: oidcUser.profile.preferred_username || '',
            displayName: oidcUser.profile.name || '',
            token: oidcUser.access_token
        };
        store.commonStore.setToken(oidcUser.access_token);
    };

    onUserUnloaded = () => {
        debugger;
        this.user = null;
        store.commonStore.setToken(null);
    };

    getUser = async () => {
        debugger;
        const token = store.commonStore.token;
        if (token) {
            try {
                const decodedToken = jwtDecode<MyTokenPayload>(token);
                this.user = {
                    mail: decodedToken.email || '',
                    userName: decodedToken.preferred_username || '',
                    displayName: decodedToken.name || '',
                    token: token
                };
            } catch (error) {
                console.error("Error decoding token", error);
                runInAction(() => {
                    this.user = null;
                    store.commonStore.setToken(null);
                });
            }
        } else {
            runInAction(() => {
                this.user = null;
            });
        }
    };

    get isLoggedIn() {
        return !!this.user;
    }

    signIn = () => {
        debugger;
        this.userManager.signinRedirect();
    };

    signOut = () => {
        debugger;
        store.commonStore.setToken(null);
        this.userManager.signoutRedirect();
    };


    handleCallback = async () => {
        try{
            await this.userManager.signinRedirectCallback();
            if (this.user && store.commonStore.token){
                router.navigate('/myregistrations');
            }
        }catch(error){
            this.userManager.signinRedirect();
        }
        
    };
}
