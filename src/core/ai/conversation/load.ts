import db from "./db";

export function loadConversation(id:string){

    return db.get(id);

}
