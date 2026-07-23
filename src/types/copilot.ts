export type CopilotRole = "user" | "assistant" | "system";

export interface CopilotMessage {
    id: string;
    role: CopilotRole;
    content: string;
    createdAt: Date;
}

export interface CopilotConversation {
    id: string;
    title: string;
    messages: CopilotMessage[];
}

export interface CopilotState {
    messages: CopilotMessage[];
    loading: boolean;
    error?: string;
}