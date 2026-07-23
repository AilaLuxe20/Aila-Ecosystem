"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  PlatformContextType,
  PlatformState,
  Workspace,
} from "../types/platform";

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<PlatformState>({
    workspaces: [],
    activeWorkspace: undefined,
    launcherOpen: false,
    searchOpen: false,
  });

  function openWorkspace(route: string) {
    setState((prev) => {
      const existing = prev.workspaces.find((w) => w.route === route);

      if (existing) {
        return {
          ...prev,
          activeWorkspace: existing,
        };
      }

      const workspace: Workspace = {
        id: crypto.randomUUID(),
        name: route.split("/").pop() ?? "Workspace",
        route,
        active: true,
      };

      return {
        ...prev,
        workspaces: [...prev.workspaces, workspace],
        activeWorkspace: workspace,
      };
    });
  }

  function closeWorkspace(id: string) {
    setState((prev) => ({
      ...prev,
      workspaces: prev.workspaces.filter((w) => w.id !== id),
    }));
  }

  function setActiveWorkspace(id: string) {
    setState((prev) => ({
      ...prev,
      activeWorkspace:
        prev.workspaces.find((w) => w.id === id) ??
        prev.activeWorkspace,
    }));
  }

  const value = useMemo(
    () => ({
      state,

      openWorkspace,

      closeWorkspace,

      setActiveWorkspace,

      openLauncher: () =>
        setState((s) => ({ ...s, launcherOpen: true })),

      closeLauncher: () =>
        setState((s) => ({ ...s, launcherOpen: false })),

      openSearch: () =>
        setState((s) => ({ ...s, searchOpen: true })),

      closeSearch: () =>
        setState((s) => ({ ...s, searchOpen: false })),
    }),
    [state]
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatformContext() {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error(
      "usePlatformContext must be used inside PlatformProvider"
    );
  }

  return context;
}
