export function summarize(messages:any[]){

    return messages
        .map(message=>message.content)
        .join(" ")
        .slice(0,1000);

}
