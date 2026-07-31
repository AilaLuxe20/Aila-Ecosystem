const memory = new Map<string, unknown>();

export function setMemory(key:string,value:unknown){
    memory.set(key,value);
}

export function getMemory(key:string){
    return memory.get(key);
}

export function getAllMemory(){
    return [...memory.entries()];
}

export function clearMemory(){
    memory.clear();
}
