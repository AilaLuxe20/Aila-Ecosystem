"use client";

import { Bot, FileText, Globe, Workflow } from "lucide-react";
import LauncherItem from "./LauncherItem";

export interface LauncherCommand {
    id: string;
    title: string;
    description: string;
    icon: typeof Bot;
    action: () => void;
}

interface LauncherCommandsProps {
    onCommand: (command: LauncherCommand) => void;
}

const commands: LauncherCommand[] = [
    {
        id: "website",
        title: "Build Website",
        description: "Generate a premium website with AI",
        icon: Globe,
        action: () => { },
    },
    {
        id: "contract",
        title: "Generate Contract",
        description: "Draft a legal contract with AI",
        icon: FileText,
        action: () => { },
    },
    {
        id: "workflow",
        title: "Create Workflow",
        description: "Build an automation workflow",
        icon: Workflow,
        action: () => { },
    },
    {
        id: "assistant",
        title: "Ask Aila",
        description: "Start an AI conversation",
        icon: Bot,
        action: () => { },
    },
];

export default function LauncherCommands({
    onCommand,
}: LauncherCommandsProps) {
    return (
        <>
            {commands.map((command) => (
                <LauncherItem
                    key={command.id}
                    icon={command.icon}
                    title={command.title}
                    description={command.description}
                    onClick={() => onCommand(command)}
                />
            ))}
        </>
    );
}