export function exportConversation(messages:any[]){

    return JSON.stringify(messages,null,2);

}
