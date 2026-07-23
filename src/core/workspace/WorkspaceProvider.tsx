"use client";

import { ReactNode } from "react";
import { WorkspaceContext } from "./WorkspaceContext";
import { createWorkspace } from "./WorkspaceEngine";

export default function WorkspaceProvider({
    children,
}: {
    children: ReactNode;
}) {
    const workspace = createWorkspace();

    return (
        <WorkspaceContext.Provider value={workspace}>
            {children}
        </WorkspaceContext.Provider>
    );
}