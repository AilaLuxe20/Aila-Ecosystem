import { ReactNode } from "react";

interface WorkspaceContentProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function WorkspaceContent({
    children,
}: WorkspaceContentProps) {
    return (
        <main className="flex-1 bg-[#050816]">
            <div className="mx-auto max-w-7xl px-8 py-8">
                {children}
            </div>
        </main>
    );
}