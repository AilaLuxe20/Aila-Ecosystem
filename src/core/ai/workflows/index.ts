const workflows=new Map<string,unknown>();

export function registerWorkflow(

    id:string,

    workflow:unknown

){

    workflows.set(id,workflow);

}

export function getWorkflow(id:string){

    return workflows.get(id);

}

export function getWorkflows(){

    return [...workflows.entries()];

}

export function deleteWorkflow(id:string){

    workflows.delete(id);

}
