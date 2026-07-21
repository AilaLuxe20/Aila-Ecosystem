"use client";
import { OrbProvider } from "@/core/OrbContext";
import WorkspaceShell from "@/components/layout/WorkspaceShell/WorkspaceShell";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrbProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </OrbProvider>
  );
}
