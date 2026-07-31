import { Models } from "@/core/ai/models";

export function getModels(){

    return Models;

}

export function getModel(id:string){

    return Models.find(model=>model.id===id);

}
