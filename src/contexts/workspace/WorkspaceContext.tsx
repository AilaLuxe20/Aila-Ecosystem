"use client";

import { createContext } from "react";

export interface WorkspaceState {
    currentProduct: string;
    sidebarCollapsed: boolean;
    copilotOpen: boolean;
}

export interface WorkspaceContextValue {
    state: WorkspaceState;
    setCurrentProduct: (product: string) => void;
    toggleSidebar: () => void;
    toggleCopilot: () => void;
}

export const WorkspaceContext =
    createContext<WorkspaceContextValue | null>(null);