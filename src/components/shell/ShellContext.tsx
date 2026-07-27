"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { STORAGE_KEYS } from "@/lib/config/app";
import { useBreakpoint } from "@/hooks/use-media-query";
import { useLocalStorage } from "@/hooks/use-storage";
import { useBoolean } from "@/hooks/use-boolean";

/**
 * Shared state for the application shell.
 *
 * The sidebar has two independent notions of "open": collapsed on desktop
 * (persisted, a deliberate preference) and open on mobile (ephemeral, a
 * transient overlay). Conflating them is what makes a responsive sidebar behave
 * strangely when the viewport crosses a breakpoint, so they are tracked
 * separately here.
 */

/** Shell state and its controls. */
export interface ShellContextValue {
  /** True when the desktop sidebar is collapsed to icons. */
  readonly sidebarCollapsed: boolean;
  /** Collapses or expands the desktop sidebar. */
  readonly setSidebarCollapsed: (collapsed: boolean) => void;
  /** Toggles the desktop sidebar. */
  readonly toggleSidebar: () => void;
  /** True when the mobile sidebar overlay is showing. */
  readonly mobileNavOpen: boolean;
  /** Opens or closes the mobile sidebar overlay. */
  readonly setMobileNavOpen: (open: boolean) => void;
  /** True below the `lg` breakpoint, where the sidebar becomes an overlay. */
  readonly isCompact: boolean;
  /** True when the command palette is showing. */
  readonly commandOpen: boolean;
  /** Opens or closes the command palette. */
  readonly setCommandOpen: (open: boolean) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/**
 * Accesses the shell state.
 *
 * @returns The shell context.
 * @throws {Error} When used outside a {@link ShellProvider}.
 */
export function useShell(): ShellContextValue {
  const context = useContext(ShellContext);

  if (!context) {
    throw new Error("useShell must be used within a ShellProvider.");
  }

  return context;
}

/** Props for {@link ShellProvider}. */
export interface ShellProviderProps {
  readonly children: React.ReactNode;
  /** Initial collapsed state before a stored preference loads. */
  readonly defaultCollapsed?: boolean;
}

/**
 * Provides shell state to the application chrome.
 *
 * @param props - Children and the default collapsed state.
 * @returns The provider element.
 */
export function ShellProvider({
  children,
  defaultCollapsed = false,
}: ShellProviderProps): React.JSX.Element {
  const [sidebarCollapsed, setStoredCollapsed] = useLocalStorage(
    STORAGE_KEYS.sidebarCollapsed,
    defaultCollapsed,
  );

  const mobileNav = useBoolean(false);
  const command = useBoolean(false);
  const { isDesktop } = useBreakpoint();

  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => setStoredCollapsed(collapsed),
    [setStoredCollapsed],
  );

  const toggleSidebar = useCallback(
    () => setStoredCollapsed((current) => !current),
    [setStoredCollapsed],
  );

  const value = useMemo<ShellContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileNavOpen: mobileNav.value,
      setMobileNavOpen: mobileNav.setValue,
      isCompact: !isDesktop,
      commandOpen: command.value,
      setCommandOpen: command.setValue,
    }),
    [
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileNav.value,
      mobileNav.setValue,
      isDesktop,
      command.value,
      command.setValue,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
