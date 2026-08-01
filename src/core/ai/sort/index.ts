export function sortMessages(messages:any[]){

    return [...messages].sort(
        (a,b)=>(a.timestamp ?? 0)-(b.timestamp ?? 0)
    );

}
