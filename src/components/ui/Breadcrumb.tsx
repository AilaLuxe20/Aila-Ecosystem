"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils/cn";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./Menu";
import { focusRing } from "./variants";

/** A single entry in a breadcrumb trail. */
export interface BreadcrumbItem {
  /** Visible text. */
  readonly label: string;
  /** Destination. Omit for the current page. */
  readonly href?: string;
  /** Icon rendered before the label. */
  readonly icon?: React.ReactNode;
}

/** Props for {@link Breadcrumb}. */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** The trail, ordered from root to current page. */
  readonly items: readonly BreadcrumbItem[];
  /**
   * Maximum entries shown before the middle collapses into a menu.
   * Defaults to 4.
   */
  readonly maxItems?: number;
}

/**
 * A hierarchical trail showing the current location.
 *
 * When the trail exceeds `maxItems`, the middle collapses into a dropdown
 * rather than wrapping onto a second line — the first and last entries carry
 * the most orientation value, so those are the ones preserved.
 *
 * @param props - The trail, collapse limit, and nav attributes.
 * @returns The breadcrumb navigation.
 *
 * @example
 * <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
 */
export function Breadcrumb({
  items,
  maxItems = 4,
  className,
  ...props
}: BreadcrumbProps): React.JSX.Element {
  const shouldCollapse = items.length > maxItems;

  const visible = shouldCollapse
    ? [items[0], ...items.slice(items.length - (maxItems - 1))]
    : items;

  const collapsed = shouldCollapse ? items.slice(1, items.length - (maxItems - 1)) : [];

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;
          const showCollapsedAfter = shouldCollapse && index === 0;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex min-w-0 items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded text-white/50 transition-colors",
                      "hover:text-white",
                      focusRing,
                    )}
                  >
                    {item.icon ? (
                      <span aria-hidden className="[&_svg]:size-3.5">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5",
                      isLast ? "font-medium text-white" : "text-white/50",
                    )}
                  >
                    {item.icon ? (
                      <span aria-hidden className="[&_svg]:size-3.5">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>

              {!isLast ? (
                <li aria-hidden className="text-white/20">
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </li>
              ) : null}

              {showCollapsedAfter && collapsed.length > 0 ? (
                <>
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Show ${collapsed.length} hidden breadcrumb levels`}
                        className={cn(
                          "grid size-5 place-items-center rounded text-white/40",
                          "transition-colors hover:text-white",
                          focusRing,
                        )}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        {collapsed.map((hidden) => (
                          <DropdownMenuItem key={hidden.label} asChild={Boolean(hidden.href)}>
                            {hidden.href ? (
                              <Link href={hidden.href}>{hidden.label}</Link>
                            ) : (
                              hidden.label
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>

                  <li aria-hidden className="text-white/20">
                    <ChevronRight className="size-3.5 rtl:rotate-180" />
                  </li>
                </>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
