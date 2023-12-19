import { makeAutoObservable, runInAction } from "mobx";
import { User } from "../models/user";
import agent from "../api/agent";
import { store } from "./store";
import { router } from "../router/Routes";

export default class UserStore {
    user : User | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn(){
        return !!this.user;
    }

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