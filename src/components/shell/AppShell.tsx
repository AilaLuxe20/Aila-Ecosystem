"use client";

import { cn } from "@/lib/utils/cn";

import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { CommandDialog } from "@/components/ui/Command";
import { ToastProvider } from "@/components/ui/Toast";
import { AppTooltipProvider } from "@/components/ui/Tooltip";

import { ShellProvider, useShell } from "./ShellContext";
import { Sidebar, type NavSection } from "./Sidebar";
import { ShellTopBar, type ShellNotification } from "./ShellTopBar";

/**
 * The application shell.
 *
 * Composes the sidebar, top bar, command palette, toast viewport, and tooltip
 * timing into one mountable frame, so a product surface only has to supply its
 * navigation and page content.
 */

/** Props for {@link AppShell}. */
export interface AppShellProps {
  /** Sidebar navigation. */
  readonly sections: readonly NavSection[];
  /** Page content. */
  readonly children: React.ReactNode;
  /** Rendered at the top of the sidebar, typically a workspace switcher. */
  readonly sidebarHeader?: React.ReactNode;
  /** Rendered at the bottom of the sidebar, typically a user menu. */
  readonly sidebarFooter?: React.ReactNode;
  /** Rendered at the start of the top bar, typically breadcrumbs. */
  readonly topBarLeading?: React.ReactNode;
  /** Actions rendered in the top bar. */
  readonly topBarActions?: React.ReactNode;
  /** Rendered at the end of the top bar, typically a user avatar. */
  readonly topBarTrailing?: React.ReactNode;
  /** Notifications shown in the bell menu. */
  readonly notifications?: readonly ShellNotification[];
  /** Command palette groups and items. */
  readonly commandItems?: React.ReactNode;
  /** Starts the sidebar collapsed before a stored preference loads. */
  readonly defaultCollapsed?: boolean;
}

/**
 * The shell's inner frame, rendered inside {@link ShellProvider}.
 *
 * Split out because it needs {@link useShell}, which the provider must already
 * be above.
 *
 * @param props - Shell configuration.
 * @returns The shell frame.
 */
function ShellFrame({
  sections,
  children,
  sidebarHeader,
  sidebarFooter,
  topBarLeading,
  topBarActions,
  topBarTrailing,
  notifications,
  commandItems,
}: Omit<AppShellProps, "defaultCollapsed">): React.JSX.Element {
  const { commandOpen, setCommandOpen } = useShell();

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar sections={sections} header={sidebarHeader} footer={sidebarFooter} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopBar
          leading={topBarLeading}
          actions={topBarActions}
          trailing={topBarTrailing}
          notifications={notifications}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <ErrorBoundary name="app-shell">{children}</ErrorBoundary>
        </main>
      </div>

      {commandItems ? (
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          {commandItems}
        </CommandDialog>
      ) : null}
    </div>
  );
}

/**
 * The complete application frame.
 *
 * @param props - Navigation, chrome content, and command palette items.
 * @returns The shell element.
 *
 * @example
 * <AppShell
 *   sections={navigation}
 *   sidebarHeader={<WorkspaceSwitcher workspaces={workspaces} />}
 *   topBarLeading={<Breadcrumb items={trail} />}
 * >
 *   <PageLayout title="Overview">{content}</PageLayout>
 * </AppShell>
 */
export function AppShell({
  defaultCollapsed = false,
  ...props
}: AppShellProps): React.JSX.Element {
  return (
    <ShellProvider defaultCollapsed={defaultCollapsed}>
      <AppTooltipProvider>
        <ToastProvider>
          <ShellFrame {...props} />
        </ToastProvider>
      </AppTooltipProvider>
    </ShellProvider>
  );
}

/** Props for {@link PageLayout}. */
export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page heading. */
  readonly title: string;
  /** Supporting text beneath the heading. */
  readonly description?: string;
  /** Actions rendered opposite the heading. */
  readonly actions?: React.ReactNode;
  /** Rendered above the heading, typically breadcrumbs. */
  readonly breadcrumb?: React.ReactNode;
  /** Rendered below the header, typically tabs. */
  readonly toolbar?: React.ReactNode;
  /** Maximum content width. Defaults to `"7xl"`. */
  readonly maxWidth?: "3xl" | "5xl" | "7xl" | "full";
  /** Removes the default padding, for full-bleed content. */
  readonly bleed?: boolean;
}

const MAX_WIDTHS: Record<NonNullable<PageLayoutProps["maxWidth"]>, string> = {
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
};

/**
 * Standard page scaffolding: heading, description, actions, and content.
 *
 * @param props - Title, description, actions, and content.
 * @returns The page layout element.
 */
export function PageLayout({
  title,
  description,
  actions,
  breadcrumb,
  toolbar,
  maxWidth = "7xl",
  bleed = false,
  className,
  children,
  ...props
}: PageLayoutProps): React.JSX.Element {
  return (
    <div className={cn("mx-auto w-full", MAX_WIDTHS[maxWidth], !bleed && "px-4 py-6 sm:px-6")}>
      <div className={cn("space-y-6", className)} {...props}>
        <div className="space-y-3">
          {breadcrumb}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-white">{title}</h1>
              {description ? (
                <p className="max-w-2xl text-sm leading-relaxed text-white/50">{description}</p>
              ) : null}
            </div>

            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>

          {toolbar}
        </div>

        {children}
      </div>
    </div>
  );
}

/** Props for {@link ContentSection}. */
export interface ContentSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Section heading. */
  readonly title?: string;
  /** Supporting text beneath the heading. */
  readonly description?: string;
  /** Actions rendered opposite the heading. */
  readonly actions?: React.ReactNode;
}

/**
 * A titled region within a page.
 *
 * @param props - Title, description, actions, and section attributes.
 * @returns The section element.
 */
export function ContentSection({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: ContentSectionProps): React.JSX.Element {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            {title ? (
              <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
            ) : null}
            {description ? <p className="text-xs text-white/45">{description}</p> : null}
          </div>

          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
