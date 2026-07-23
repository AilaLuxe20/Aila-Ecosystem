"use client";

import { ReactNode, useState } from "react";
import WorkspaceTopbar from "./WorkspaceTopbar";
import WorkspaceContent from "./WorkspaceContent";
import { AilaCopilot } from "@/components/copilot";

interface WorkspaceShellProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function WorkspaceShell({
    title,
    description,
    children,
}: WorkspaceShellProps) {
    const [copilotOpen, setCopilotOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050816] text-white">
            <WorkspaceTopbar
                onToggleCopilot={() =>
                    setCopilotOpen((open) => !open)
                }
            />

            <div className="mx-auto flex max-w-7xl">

                <div className="flex-1">
                    <WorkspaceContent
                        title={title}
                        description={description}
                    >
                        {children}
                    </WorkspaceContent>
                </div>

                {copilotOpen && (
                    <aside className="w-[420px] border-l border-white/10 bg-black">
                        <AilaCopilot />
                    </aside>
                )}

            </div>
        </div>
    );
}