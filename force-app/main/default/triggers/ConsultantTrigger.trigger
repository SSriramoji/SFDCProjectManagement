trigger ConsultantTrigger on Consultant__c (before insert) {
    ConsultantTriggerHandler.checkIfProjectPricingExist(Trigger.New);

}