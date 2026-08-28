const extensions=new Map<string,unknown>();

export function registerExtension(

    id:string,

    extension:unknown

){

    extensions.set(id,extension);

}

export function getExtension(id:string){

    return extensions.get(id);

}

export function getExtensions(){

    return [...extensions.entries()];

}

export function removeExtension(id:string){

    extensions.delete(id);

}
