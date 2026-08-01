export function deduplicateMessages(messages:any[]){

    const seen=new Set<string>();

    return messages.filter(message=>{

        const key=JSON.stringify(message);

        if(seen.has(key)) return false;

        seen.add(key);

        return true;

    });

}
