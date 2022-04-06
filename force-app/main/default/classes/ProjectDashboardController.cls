public with sharing class ProjectDashboardController {
    // public class ProjectAndConsultantWrapper{
    //     @AuraEnabled
    //     public String projectName;
    //     @AuraEnabled
    //     public String projectId;
    //     @AuraEnabled
    //     public List<Consultant__c> consultantList;
    // }
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> listOfEmployeeInFreePool(){
        try {
            Set<Id> setOfConultants=new Set<Id>();
            for(Consultant__c con:[Select Id,Employee__c from Consultant__c Where End_Date__c=null]){
                setOfConultants.add(con.Employee__c);
            }
            List<Employee__c> listOfEmployee=[Select Id,Name,Skills__c from Employee__c Where Id Not in :setOfConultants];

            return listOfEmployee;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Map<String,List<Consultant__c>> getProjectsAssignedToManager(){
        try {
            Map<String,List<Consultant__c>> mapOfConAndProject=new Map<String,List<Consultant__c>>();
            for(Consultant__c con:[Select Employee__r.Name,Project__c,Project__r.Name, Start_Date__c,Role_in_Project__c
            from Consultant__c
            Where Project__r.Project_Manager__c=:UserInfo.getUserId() ]){
                List<Consultant__c> listOfCon=new List<Consultant__c>();
                if(mapOfConAndProject.containsKey(con.Project__c+'-'+con.Project__r.Name)){
                    listOfCon=mapOfConAndProject.get(con.Project__c+'-'+con.Project__r.Name);
                    listOfCon.add(con);
                    mapOfConAndProject.put(con.Project__c+'-'+con.Project__r.Name,listOfCon);
                }else{
                    listOfCon.add(con);
                    mapOfConAndProject.put(con.Project__c+'-'+con.Project__r.Name,listOfCon);
                }
            }
            List<Project__c> listOfPro=[Select Id,Name from Project__c Where Project_Manager__c=:UserInfo.getUserId() ];
            if(listOfPro.size()>0){
                for(Project__c project:listOfPro){
                    if(!mapOfConAndProject.containsKey(project.Id+'-'+project.Name)){
                        mapOfConAndProject.put(project.Id+'-'+project.Name,new List<Consultant__c>());
                    }
                }
            }
            return mapOfConAndProject;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}