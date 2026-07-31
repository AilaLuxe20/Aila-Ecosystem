import type { ChatMessage } from "@/core/types";

export interface Conversation{
    id:string;
    createdAt:string;
    updatedAt:string;
    messages:ChatMessage[];
}
