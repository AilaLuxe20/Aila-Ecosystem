const cache=new Map<string,unknown>();

export function setCache(key:string,value:unknown){

    cache.set(key,value);

}

export function getCache(key:string){

    return cache.get(key);

}

export function clearCache(){

    cache.clear();

}
