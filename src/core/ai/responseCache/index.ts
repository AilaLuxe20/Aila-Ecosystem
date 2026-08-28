const responses=new Map<string,string>();

export function cacheResponse(

    id:string,

    response:string

){

    responses.set(id,response);

}

export function getCachedResponse(id:string){

    return responses.get(id);

}

export function clearResponseCache(){

    responses.clear();

}
