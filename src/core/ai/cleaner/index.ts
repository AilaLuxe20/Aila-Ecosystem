export function cleanConversation(messages:any[]){

    return messages.filter(

        message=>

            typeof message.content==="string" &&
            message.content.trim().length>0

    );

}
