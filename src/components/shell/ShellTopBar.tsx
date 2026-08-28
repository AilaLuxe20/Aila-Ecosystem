"use client";

import { Bell, Menu, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { LAYOUT_METRICS } from "@/lib/theme/tokens";

import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Menu";
import { EmptyState } from "@/components/ui/States";
import { Tooltip } from "@/components/ui/Tooltip";
import { focusRing } from "@/components/ui/variants";

import { useShell } from "./ShellContext";

/** A notification shown in the shell's notification menu. */
export interface ShellNotification {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  /** Pre-formatted relative time, e.g. "2 hours ago". */
  readonly timestamp?: string;
  /** Marks the notification unread. */
  readonly unread?: boolean;
  /** Invoked when the notification is activated. */
  readonly onSelect?: () => void;
}

/** Props for {@link ShellTopBar}. */
export interface ShellTopBarProps {
  /** Breadcrumb or page title rendered at the start of the bar. */
  readonly leading?: React.ReactNode;
  /** Actions rendered before the notification menu. */
  readonly actions?: React.ReactNode;
  /** Notifications shown in the bell menu. */
  readonly notifications?: readonly ShellNotification[];
  /** User menu or avatar rendered at the end of the bar. */
  readonly trailing?: React.ReactNode;
  /** Hides the global search trigger. */
  readonly hideSearch?: boolean;
}

/**
 * The application top bar.
 *
 * The search control is a button that opens the command palette rather than an
 * input, because a palette handles navigation, actions, and search in one
 * surface — a separate search field would duplicate a third of it.
 *
 * @param props - Leading content, actions, notifications, and trailing content.
 * @returns The top bar element.
 */
export function ShellTopBar({
  leading,
  actions,
  notifications = [],
  trailing,
  hideSearch = false,
}: ShellTopBarProps): React.JSX.Element {
  const { isCompact, setMobileNavOpen, setCommandOpen } = useShell();
  const unreadCount = notifications.filter((entry) => entry.unread).length;

  return (
    <header
      style={{ height: LAYOUT_METRICS.topBarHeight }}
      className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-hairline bg-surface/85 px-3 backdrop-blur-md"
    >
      {isCompact ? (
        <IconButton
          label="Open navigation"
          icon={<Menu />}
          variant="ghost"
          size="sm"
          onClick={() => setMobileNavOpen(true)}
        />
      ) : null}

      <div className="min-w-0 flex-1">{leading}</div>

      {hideSearch ? null : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCommandOpen(true)}
          leadingIcon={<Search />}
          className="hidden gap-6 text-white/45 md:inline-flex"
        >
          Search
          <kbd className="rounded border border-hairline bg-surface-sunken px-1.5 py-0.5 font-mono text-2xs text-white/40">
            ⌘K
          </kbd>
        </Button>
      )}

      {hideSearch ? null : (
        <IconButton
          label="Search"
          icon={<Search />}
          variant="ghost"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="md:hidden"
        />
      )}

      {actions}

      <DropdownMenu>
        <Tooltip content="Notifications">
          <DropdownMenuTrigger asChild>
            <span className="relative inline-flex">
              <IconButton
                label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
                icon={<Bell />}
                variant="ghost"
                size="sm"
              />

              {unreadCount > 0 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute end-1 top-1 size-1.5 rounded-full bg-danger ring-2 ring-surface"
                />
              ) : null}
            </span>
          </DropdownMenuTrigger>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-80 p-0">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
            Notifications
            {unreadCount > 0 ? (
              <Badge size="sm" tone="brand">
                {unreadCount} new
              </Badge>
            ) : null}
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="mx-0" />

          {notifications.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              description="New notifications will appear here."
              compact
            />
          ) : (
            <ul className="max-h-96 overflow-y-auto p-1">
              {notifications.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={entry.onSelect}
                    className={cn(
                      "flex w-full gap-2.5 rounded-[0.375rem] px-2 py-2 text-start",
                      "transition-colors hover:bg-surface-raised",
                      focusRing,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        entry.unread ? "bg-brand-400" : "bg-transparent",
                      )}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white">{entry.title}</span>

                      {entry.description ? (
                        <span className="mt-0.5 block text-xs leading-relaxed text-white/55">
                          {entry.description}
                        </span>
                      ) : null}

                      {entry.timestamp ? (
                        <span className="mt-1 block text-2xs text-white/30">
                          {entry.timestamp}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {trailing}
    </header>
  );
}
