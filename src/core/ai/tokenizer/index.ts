export function estimateTokens(text:string){

    return Math.ceil(text.length/4);

}

export function estimateMessageTokens(messages:any[]){

    return messages.reduce(

        (total,message)=>

            total+estimateTokens(message.content ?? ""),

        0

    );

}
