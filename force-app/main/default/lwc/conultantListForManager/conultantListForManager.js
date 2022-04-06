import { LightningElement,wire,track } from 'lwc';
import listOfEmployeeInFreePool from '@salesforce/apex/ProjectDashboardController.listOfEmployeeInFreePool';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import messageChannel from '@salesforce/messageChannel/ConsultantMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

export default class ConultantListForManager extends LightningElement {
    @track consultantRecordFields=['Project__c','Role_in_Project__c'];
    isModalOpen=false;
    @track listOfEmployees=[];
    @track wiredListOfEmployee=[];
    employeeId;
    employeeName;
    @wire(listOfEmployeeInFreePool)
    wiredEmployeesData(value){
    this.wiredListOfEmployee=value;
    const {data,error}=value;
    if(data){
        this.listOfEmployees=[...data];
        console.log('this.listOfEmployees '+JSON.stringify(this.listOfEmployees));
    }else{
        console.log('error '+JSON.stringify(error));
    }
    }
    //START:Lightning Messaging Service
    @wire(MessageContext)
    messageContext; 
    updateRelatedComponents = () => {
        const payload = { source : 'ConsultantList', data : this.employeeName };
        publish(this.messageContext, messageChannel, payload);
        console.log('event published with payload '+JSON.stringify(payload));
    };
    //END:Lightning Messaging Service

    handleAssignProject(event){
        this.employeeId = event.target.dataset.id;
        this.employeeName= event.target.dataset.name;
        console.log('employeeName '+this.employeeName+' employee di '+ this.employeeId);
        this.isModalOpen=true;
    }
    handleSubmit(event){
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.Name = this.employeeName; 
        fields.Employee__c=this.employeeId;
        var dateVar = new Date();
        fields.Start_Date__c=new Date(dateVar.getTime() + dateVar.getTimezoneOffset()*60000).toISOString();
        console.log('fields', fields);
        console.log('fields 2', fields.Start_Date__c);
        this.template.querySelector('lightning-record-form').submit(fields);
     }
     handleSuccess(event) {
        console.log('fields');
        this.isModalOpen=false;
        this.refreshData();
        this.updateRelatedComponents();
        const evt = new ShowToastEvent({
            title: "Assigned To Project",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
    }

    handleCancel(){
        this.isModalOpen=false;
    }
    async refreshData(){
        await refreshApex(this.wiredListOfEmployee);
    }
}