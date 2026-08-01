import type { ChatMessage } from "@/core/types";

export function createContextWindow(

    messages:ChatMessage[],

    limit:number=20

){

    return messages.slice(-limit);

}
