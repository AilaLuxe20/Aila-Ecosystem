"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { cn } from "@/lib/utils/cn";
import { LAYOUT_METRICS } from "@/lib/theme/tokens";

import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/Drawer";
import { Tooltip } from "@/components/ui/Tooltip";
import { focusRing } from "@/components/ui/variants";

import { useShell } from "./ShellContext";

/** A navigable entry in the sidebar. */
export interface NavItem {
  /** Stable identifier. */
  readonly id: string;
  /** Visible text. */
  readonly label: string;
  /** Destination path. */
  readonly href: string;
  /** Icon shown beside the label, and alone when collapsed. */
  readonly icon: React.ReactNode;
  /** Count or status shown at the end of the row. */
  readonly badge?: string | number;
  /** Marks the item unavailable, e.g. when the plan does not include it. */
  readonly disabled?: boolean;
}

/** A titled group of navigation items. */
export interface NavSection {
  /** Stable identifier. */
  readonly id: string;
  /** Heading shown above the group. Omit for an untitled group. */
  readonly title?: string;
  /** Items in the group. */
  readonly items: readonly NavItem[];
}

/** Props for {@link Sidebar}. */
export interface SidebarProps {
  /** Navigation content, in display order. */
  readonly sections: readonly NavSection[];
  /** Rendered above the navigation, typically a workspace switcher. */
  readonly header?: React.ReactNode;
  /** Rendered below the navigation, typically a user menu. */
  readonly footer?: React.ReactNode;
}

/**
 * Reports whether a nav item matches the current path.
 *
 * A prefix match is used so a nested route keeps its parent highlighted, with
 * the root path special-cased to avoid matching everything.
 *
 * @param pathname - The current path.
 * @param href - The item's destination.
 * @returns True when the item should render as active.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Renders the navigation list, shared by the docked and overlay presentations.
 *
 * @param props - Sections and whether to render in collapsed form.
 * @returns The navigation element.
 */
function SidebarNav({
  sections,
  collapsed,
  onNavigate,
}: {
  readonly sections: readonly NavSection[];
  readonly collapsed: boolean;
  readonly onNavigate?: () => void;
}): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2 py-3">
      {sections.map((section) => (
        <Fragment key={section.id}>
          {section.title && !collapsed ? (
            <p className="px-2 pt-3 pb-1.5 text-2xs font-medium tracking-wide text-white/30 uppercase first:pt-0">
              {section.title}
            </p>
          ) : null}

          {section.title && collapsed ? <div className="my-2 h-px bg-hairline" /> : null}

          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              const link = (
                <Link
                  href={item.disabled ? "#" : item.href}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-control px-2 py-2 text-sm",
                    "transition-colors duration-fast ease-standard",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-brand-500/12 font-medium text-brand-200"
                      : "text-white/60 hover:bg-surface-raised hover:text-white",
                    item.disabled && "pointer-events-none opacity-35",
                    focusRing,
                  )}
                >
                  <span aria-hidden className="shrink-0 [&_svg]:size-4">
                    {item.icon}
                  </span>

                  {collapsed ? null : (
                    <>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined ? (
                        <Badge size="sm" tone={active ? "brand" : "neutral"}>
                          {item.badge}
                        </Badge>
                      ) : null}
                    </>
                  )}
                </Link>
              );

              return (
                <li key={item.id}>
                  {collapsed ? (
                    <Tooltip content={item.label} side="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </Fragment>
      ))}
    </nav>
  );
}

/**
 * The application sidebar.
 *
 * Renders as a docked, collapsible rail on desktop and as a drawer overlay
 * below the `lg` breakpoint. Both presentations share {@link SidebarNav}, so
 * navigation stays identical across them.
 *
 * @param props - Sections, header, and footer content.
 * @returns The sidebar element.
 */
export function Sidebar({ sections, header, footer }: SidebarProps): React.JSX.Element {
  const { sidebarCollapsed, toggleSidebar, isCompact, mobileNavOpen, setMobileNavOpen } =
    useShell();

  if (isCompact) {
    return (
      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DrawerContent side="left" size="sm" className="p-0">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>

          {header ? <div className="border-b border-hairline p-3">{header}</div> : null}

          <SidebarNav
            sections={sections}
            collapsed={false}
            onNavigate={() => setMobileNavOpen(false)}
          />

          {footer ? <div className="border-t border-hairline p-3">{footer}</div> : null}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside
      style={{
        width: sidebarCollapsed
          ? LAYOUT_METRICS.sidebarCollapsedWidth
          : LAYOUT_METRICS.sidebarWidth,
      }}
      className={cn(
        "relative flex h-full shrink-0 flex-col border-e border-hairline bg-surface-sunken",
        "transition-[width] duration-normal ease-emphasized",
      )}
    >
      {header ? (
        <div className={cn("border-b border-hairline p-3", sidebarCollapsed && "px-2")}>
          {header}
        </div>
      ) : null}

      <SidebarNav sections={sections} collapsed={sidebarCollapsed} />

      {footer ? (
        <div className={cn("border-t border-hairline p-3", sidebarCollapsed && "px-2")}>
          {footer}
        </div>
      ) : null}

      <IconButton
        label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        icon={
          <ChevronLeft
            className={cn(
              "transition-transform duration-normal ease-emphasized",
              sidebarCollapsed && "rotate-180",
            )}
          />
        }
        variant="secondary"
        size="xs"
        onClick={toggleSidebar}
        className="absolute -end-3 top-16 z-10 rounded-full shadow-elevation-2"
      />
    </aside>
  );
}
