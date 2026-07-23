import { CopilotMessage } from "@/types/copilot";

interface Props {
    message: CopilotMessage;
}

export default function MessageBubble({ message }: Props) {
    const isAssistant = message.role === "assistant";

    return (
        <div
            className={`flex ${isAssistant ? "justify-start" : "justify-end"
                }`}
        >
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isAssistant
                        ? "bg-neutral-800 text-white"
                        : "bg-white text-black"
                    }`}
            >
                {message.content}
            </div>
        </div>
    );
}