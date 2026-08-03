import db from "./db";

export function deleteConversation(id:string){

    db.delete(id);

}
