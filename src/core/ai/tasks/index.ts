const tasks=new Map<string,unknown>();

export function createTask(id:string,task:unknown){

    tasks.set(id,task);

}

export function getTask(id:string){

    return tasks.get(id);

}

export function getAllTasks(){

    return [...tasks.entries()];

}

export function deleteTask(id:string){

    tasks.delete(id);

}
