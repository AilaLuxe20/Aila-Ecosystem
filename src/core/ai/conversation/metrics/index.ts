export function conversationMetrics(messages:any[]){

    return{

        messages:messages.length,

        characters:messages.reduce(
            (a,m)=>a+(m.content?.length ?? 0),
            0
        )

    };

}
