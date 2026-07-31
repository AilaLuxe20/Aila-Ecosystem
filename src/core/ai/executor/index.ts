export async function executeTool(id:string,input:unknown){

    return{
        tool:id,
        input,
        executed:true
    };

}
