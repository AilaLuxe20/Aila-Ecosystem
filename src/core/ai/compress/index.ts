export function compressConversation(messages:any[]){

    return messages.map(message=>({

        role:message.role,

        content:(message.content ?? "").trim()

    }));

}
