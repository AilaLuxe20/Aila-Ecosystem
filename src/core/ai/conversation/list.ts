import db from "./db";

export function listConversations(){

    return [...db.values()];

}
