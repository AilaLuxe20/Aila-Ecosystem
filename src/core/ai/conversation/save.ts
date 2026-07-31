import db from "./db";
import type { Conversation } from "./types";

export function saveConversation(c:Conversation){

    db.set(c.id,c);

}
