export function validateConversation(messages:any[]){

    return{

        valid:Array.isArray(messages),

        count:messages.length

    };

}
