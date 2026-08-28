"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useMemo } from "react";

import { STORAGE_KEYS } from "@/lib/config/app";
import { cn } from "@/lib/utils/cn";
import { useLocalStorage } from "@/hooks/use-storage";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Menu";
import { focusRing } from "@/components/ui/variants";

import { useShell } from "./ShellContext";

/** A workspace the user can switch between. */
export interface Workspace {
  readonly id: string;
  readonly name: string;
  /** Logo or avatar image. Falls back to initials. */
  readonly imageUrl?: string | null;
  /** Plan label shown beside the name. */
  readonly plan?: string;
}

/** Props for {@link WorkspaceSwitcher}. */
export interface WorkspaceSwitcherProps {
  /** Workspaces available to the user. */
  readonly workspaces: readonly Workspace[];
  /** Controlled active workspace ID. */
  readonly activeId?: string;
  /** Called when the active workspace changes. */
  readonly onWorkspaceChange?: (workspace: Workspace) => void;
  /** Called when the create action is selected. Hidden when omitted. */
  readonly onCreateWorkspace?: () => void;
}

/**
 * Switches between workspaces from the sidebar header.
 *
 * The selection persists to local storage so a reload returns the user to the
 * workspace they were last in, rather than resetting to the first in the list.
 *
 * @param props - Workspaces, active ID, and change handlers.
 * @returns The workspace switcher element.
 */
export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onWorkspaceChange,
  onCreateWorkspace,
}: WorkspaceSwitcherProps): React.JSX.Element | null {
  const { sidebarCollapsed, isCompact } = useShell();
  const [storedId, setStoredId] = useLocalStorage<string | null>(STORAGE_KEYS.workspaceId, null);

  const resolvedId = activeId ?? storedId ?? workspaces[0]?.id ?? null;

  const active = useMemo(
    () => workspaces.find((workspace) => workspace.id === resolvedId) ?? workspaces[0] ?? null,
    [workspaces, resolvedId],
  );

  if (!active) return null;

  const collapsed = sidebarCollapsed && !isCompact;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Current workspace: ${active.name}. Switch workspace`}
        className={cn(
          "flex w-full items-center gap-2 rounded-control p-1.5 text-start",
          "transition-colors hover:bg-surface-raised",
          collapsed && "justify-center",
          focusRing,
        )}
      >
        <Avatar name={active.name} src={active.imageUrl} size="sm" shape="square" />

        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{active.name}</span>
              {active.plan ? (
                <span className="block truncate text-2xs text-white/40">{active.plan}</span>
              ) : null}
            </span>

            <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-white/35" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>

        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => {
              setStoredId(workspace.id);
              onWorkspaceChange?.(workspace);
            }}
          >
            <Avatar name={workspace.name} src={workspace.imageUrl} size="xs" shape="square" />

            <span className="min-w-0 flex-1 truncate">{workspace.name}</span>

            {workspace.plan ? (
              <Badge size="sm" tone="neutral">
                {workspace.plan}
              </Badge>
            ) : null}

            {workspace.id === active.id ? (
              <Check aria-hidden className="size-3.5 text-brand-400" />
            ) : null}
          </DropdownMenuItem>
        ))}

        {onCreateWorkspace ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Plus />} onSelect={onCreateWorkspace}>
              Create workspace
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
