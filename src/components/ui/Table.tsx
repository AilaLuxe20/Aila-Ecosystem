"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

import { focusRing } from "./variants";

/**
 * Semantic table primitives.
 *
 * These are thin styled wrappers over real table elements. Keeping genuine
 * `<table>` semantics — rather than a grid of divs — is what gives screen
 * readers row and column context while navigating cells.
 */

/** Props for {@link Table}. */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Pins the header while the body scrolls. */
  readonly stickyHeader?: boolean;
  /** Reduces row height for dense data. */
  readonly dense?: boolean;
}

/**
 * A data table.
 *
 * The wrapper scrolls horizontally and is focusable, so a keyboard user can
 * scroll a wide table without a pointer.
 *
 * @param props - Sticky header, density, and table attributes.
 * @returns The table element inside a scroll container.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, stickyHeader = false, dense = false, ...props },
  ref,
) {
  return (
    <div
      tabIndex={0}
      className={cn("relative w-full overflow-x-auto rounded-panel", focusRing)}
    >
      <table
        ref={ref}
        data-dense={dense || undefined}
        data-sticky={stickyHeader || undefined}
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
});

/**
 * The table header group.
 *
 * @param props - Section attributes.
 * @returns The `thead` element.
 */
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={cn(
        "border-b border-hairline",
        "[table[data-sticky]_&]:sticky [table[data-sticky]_&]:top-0 [table[data-sticky]_&]:z-10 [table[data-sticky]_&]:bg-surface",
        className,
      )}
      {...props}
    />
  );
});

/**
 * The table body.
 *
 * @param props - Section attributes.
 * @returns The `tbody` element.
 */
export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn("divide-y divide-hairline", className)} {...props} />;
});

/**
 * The table footer, typically holding totals.
 *
 * @param props - Section attributes.
 * @returns The `tfoot` element.
 */
export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn("border-t border-hairline bg-surface-sunken font-medium", className)}
      {...props}
    />
  );
});

/** Props for {@link TableRow}. */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row as selected. */
  readonly selected?: boolean;
  /** Adds hover feedback and a pointer cursor. */
  readonly interactive?: boolean;
}

/**
 * A table row.
 *
 * @param props - Selection, interactivity, and row attributes.
 * @returns The `tr` element.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, interactive, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      data-state={selected ? "selected" : undefined}
      aria-selected={selected}
      className={cn(
        "transition-colors duration-instant",
        interactive && "cursor-pointer hover:bg-surface-raised/60",
        selected && "bg-brand-500/8",
        className,
      )}
      {...props}
    />
  );
});

/** Sort state of a column. */
export type SortState = "asc" | "desc" | false;

/** Props for {@link TableHead}. */
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Current sort direction, or false when unsorted. */
  readonly sorted?: SortState;
  /** Makes the header a sort control. */
  readonly onSort?: () => void;
  /** Right-aligns the content, for numeric columns. */
  readonly numeric?: boolean;
}

/**
 * A header cell, optionally sortable.
 *
 * Sets `aria-sort` so assistive technology announces the current ordering — a
 * sort arrow alone is invisible to a screen reader.
 *
 * @param props - Sort state, sort handler, alignment, and cell attributes.
 * @returns The `th` element.
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, sorted = false, onSort, numeric, children, ...props },
  ref,
) {
  const content = (
    <>
      {children}
      {onSort ? (
        <span aria-hidden className="ms-1.5 inline-flex text-white/30">
          {sorted === "asc" ? (
            <ArrowUp className="size-3" />
          ) : sorted === "desc" ? (
            <ArrowDown className="size-3" />
          ) : (
            <ChevronsUpDown className="size-3" />
          )}
        </span>
      ) : null}
    </>
  );

  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
      className={cn(
        "px-3 py-2.5 text-start text-2xs font-medium tracking-wide text-white/45 uppercase",
        "[table[data-dense]_&]:py-1.5",
        numeric && "text-end",
        className,
      )}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "inline-flex items-center rounded transition-colors hover:text-white/75",
            focusRing,
          )}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </th>
  );
});

/** Props for {@link TableCell}. */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-aligns and tabularises the content, for numeric columns. */
  readonly numeric?: boolean;
}

/**
 * A data cell.
 *
 * @param props - Alignment and cell attributes.
 * @returns The `td` element.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, numeric, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={cn(
        "px-3 py-2.5 align-middle text-white/80",
        "[table[data-dense]_&]:py-1.5",
        numeric && "text-end tabular-nums",
        className,
      )}
      {...props}
    />
  );
});

/**
 * A caption describing the table, announced before its contents.
 *
 * @param props - Caption attributes.
 * @returns The `caption` element.
 */
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return <caption ref={ref} className={cn("mt-3 text-xs text-white/40", className)} {...props} />;
});
