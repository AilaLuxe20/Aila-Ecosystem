const capabilities=new Map<string,unknown>();

export function registerCapability(id:string,capability:unknown){

    capabilities.set(id,capability);

}

export function getCapability(id:string){

    return capabilities.get(id);

}

export function getCapabilities(){

    return [...capabilities.entries()];

}

export function removeCapability(id:string){

    capabilities.delete(id);

}
