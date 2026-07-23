"use client";

import { OrbProvider } from "@/core/OrbContext";
import WorkspaceProvider from "@/core/workspace/WorkspaceProvider";
import WorkspaceShell from "@/components/layout/WorkspaceShell/WorkspaceShell";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrbProvider>
      <WorkspaceProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </WorkspaceProvider>
    </OrbProvider>
  );
}