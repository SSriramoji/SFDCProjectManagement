public class ConsultantTriggerHandler {

    
    public static void checkIfProjectPricingExist(List<Consultant__c> consultantList){
        Set<Id> project=new Set<Id>();
        
        for(Consultant__c con:consultantList){
            project.add(con.Project__c);
           
        }
       Map<String,Decimal> mapOfProRoleAndCurrency=new  Map<String,Decimal>();
            for(Project_Pricing__c pp:[Select Consultant_rate__c,Pricing_Unit__c,Project__c,Role_In_Project__c
                                       from Project_Pricing__c
                                       Where Project__c=:project] ){
                                           mapOfProRoleAndCurrency.put(pp.Project__c+'-'+pp.Role_In_Project__c,pp.Consultant_rate__c);
                                       }
        for(Consultant__c con:consultantList){
            if(!mapOfProRoleAndCurrency.containsKey(con.Project__c+'-'+con.Role_in_Project__c)){
                con.addError('No Pricing Defined for this role in Project, Please use project pricing to define price for the consultant role');
            }
        }
    }
}