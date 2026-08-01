export function validateMessages(messages:any[]){

    return messages.every(message=>

        typeof message.role==="string" &&
        typeof message.content==="string"

    );

}
