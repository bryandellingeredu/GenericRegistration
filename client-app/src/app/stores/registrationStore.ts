import { makeAutoObservable } from "mobx";
import { Registration } from "../models/registration";
import agent from "../api/agent";
import {v4 as uuid} from 'uuid';

export default class RegistrationStore{
    registrationRegistry = new Map<string, Registration>();
    registrationLoadingInitial = false;
    registrationLoading = false;
    selectedRegistration : Registration | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
      }

      get registrations() {
        return Array.from(this.registrationRegistry.values()).sort((a, b) =>
        a.lastName > b.lastName ? 1 : -1);
      }

      loadRegistrations = async () => {
        this.setRegistrationLoadingInitial(true);
        try{
         const registrations = await agent.Registrations.list();
         registrations.forEach(registration =>{
            registration.registrationDate = new Date(registration.registrationDate)
            this.addRegistration(registration);
         })
         this.setRegistrationLoadingInitial(false);
        }
        catch(error){
            this.setRegistrationLoadingInitial(false);
           console.log(error) 
        }
      }

      saveRegistration = async (registration: Registration, operation: 'create' | 'update') => {
        this.setRegistrationLoading(true);
    
        try {
            if (operation === 'create') {
                registration.id = uuid(); // Assign a new UUID for creation
                await agent.Registrations.create(registration);
            } else if (operation === 'update') {
                await agent.Registrations.update(registration);
            }
    
            this.addRegistration(registration);
            this.selectRegistration(registration.id);
        } catch (error) {
            console.log(error);
        } finally {
            this.setRegistrationLoading(false);
        }
    }

      deleteRegistration = async (id: string) =>{
        this.setRegistrationLoading(true);
        try{
           await agent.Registrations.delete(id);
           this.removeRegistration(id);
           this.setRegistrationLoading(false);
        }catch(error){
            this.setRegistrationLoading(false);
            console.log(error);
        }
      }

      selectRegistration = (id: string) => this.selectedRegistration = this.registrationRegistry.get(id);

      cancelSelectRegistration = () => this.selectedRegistration = undefined;
      
      setRegistrationLoadingInitial = (state: boolean) => this.registrationLoadingInitial = state;
      
      setRegistrationLoading = (state: boolean) => this.registrationLoading = state;
      
      addRegistration = (registration: Registration) => this.registrationRegistry.set(registration.id, registration);
      
      removeRegistration = (id: string) => this.registrationRegistry.delete(id);   
    
}