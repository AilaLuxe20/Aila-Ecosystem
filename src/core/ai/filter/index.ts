export function filterMessages(messages:any[]){

    return messages.filter(

        message=>message?.content

    );

}
