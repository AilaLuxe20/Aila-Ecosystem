const plugins=new Map<string,unknown>();

export function registerPlugin(

    id:string,

    plugin:unknown

){

    plugins.set(id,plugin);

}

export function getPlugin(id:string){

    return plugins.get(id);

}

export function getPlugins(){

    return [...plugins.entries()];

}

export function removePlugin(id:string){

    plugins.delete(id);

}
