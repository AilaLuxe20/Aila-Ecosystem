export function analyzeConversation(messages:any[]){

    return{

        totalMessages:messages.length,

        userMessages:messages.filter(
            m=>m.role==="user"
        ).length,

        assistantMessages:messages.filter(
            m=>m.role==="assistant"
        ).length

    };

}
