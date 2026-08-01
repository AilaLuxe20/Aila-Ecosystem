export function mergeMessages(

    history:any[],

    current:any[]

){

    return [

        ...history,

        ...current

    ];

}
