"use client";

import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import AppFooter from "./AppFooter";

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex h-screen bg-[#050816] text-white overflow-hidden">
            <AppSidebar />

            <div className="flex flex-1 flex-col">
                <AppTopbar />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>

                <AppFooter />
            </div>
        </div>
    );
}