import { LightningElement,wire,track } from 'lwc';
import getProjectsAssignedToManager from '@salesforce/apex/ProjectDashboardController.getProjectsAssignedToManager';
import {subscribe,unsubscribe,createMessageContext,releaseMessageContext,APPLICATION_SCOPE} from 'lightning/messageService';
import messageChannel from "@salesforce/messageChannel/ConsultantMessageChannel__c";
import { refreshApex } from '@salesforce/apex';
export default class ProjectManagerDashboard extends LightningElement {
    //START: Lightning Mesageing Service
    subscription = null;
    payload='';
    contextvar = createMessageContext();
    indication = 'UNSUBSCRIBED';
    subscribeMsg() {
        if (this.subscription) {
            return;
        }
        else{
            this.indication = 'SUBSCRIBED';
        }
        this.subscription = subscribe(this.contextvar,messageChannel, (message) => { //Subscribe method
            console.log('recieved subscription');
                this.payload  = JSON.stringify(message);
                this.showSpinner=true;
                this.refreshData();
                
        }, {scope: APPLICATION_SCOPE}); //Required from Spring'20 Update - Make sure to Import it.
     }
 
     unsubscribeMsg() {
         unsubscribe(this.subscription);
         this.subscription = null;
         this.indication = 'UNSUBSCRIBED';
         this.payload = '';
     }

     disconnectedCallback() {
         releaseMessageContext(this.context);
     }
    
    //END: Lightning Mesageing Service
wiredProjects;
showSpinner=false;
@track listOfProjectAndConsultant;
isRendered=false;
renderedCallback(){
    if(!this.isRendered){
        this.subscribeMsg();
        this.isRendered=true;
    }
    
}
@wire(getProjectsAssignedToManager)
wiredProjectsData(value){
this.wiredProjects=value;
const { data, error } = value;
if(data){
    
    this.listOfProjectAndConsultant=[...this.simplifyProjectAndConsultantData(data)];
}else{
    console.log('error '+JSON.stringify(error));
}
}


simplifyProjectAndConsultantData(mapOfProjects){
let mapOfAllData=[];
    for (let key in mapOfProjects) {
        mapOfAllData.push({listOfConsultant:mapOfProjects[key], project:key.split('-')[1]});
     }
     console.log('mapOfAllData '+JSON.stringify(mapOfAllData));
return mapOfAllData;
}

async refreshData(){
   await refreshApex(this.wiredProjects);
   this.showSpinner=false;;
}
}