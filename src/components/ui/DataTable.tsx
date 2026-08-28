"use client";

import { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { sortBy } from "@/lib/utils/array";
import { usePagination } from "@/hooks/use-pagination";

import { Checkbox } from "./Checkbox";
import { Pagination } from "./Pagination";
import { EmptyState, ErrorState } from "./States";
import { SkeletonText } from "./Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type SortState,
} from "./Table";

/**
 * A composed data grid.
 *
 * Sorting, selection, and pagination are all client-side here, which is correct
 * for datasets already in memory. For server-driven data, pass `sort` and
 * `page` as controlled props and perform the work upstream — the component does
 * not assume it owns the data.
 */

/** Describes one column of a {@link DataTable}. */
export interface DataTableColumn<T> {
  /** Stable identifier, also used as the React key. */
  readonly id: string;
  /** Column heading. */
  readonly header: React.ReactNode;
  /** Renders the cell for a row. */
  readonly cell: (row: T, index: number) => React.ReactNode;
  /** Extracts the value used when sorting. Omit to make the column unsortable. */
  readonly sortValue?: (row: T) => string | number | Date;
  /** Right-aligns and tabularises the column. */
  readonly numeric?: boolean;
  /** Fixed width, as any CSS length. */
  readonly width?: string;
  /** Additional classes applied to every cell in the column. */
  readonly className?: string;
}

/** Props for {@link DataTable}. */
export interface DataTableProps<T> {
  /** The rows to display. */
  readonly rows: readonly T[];
  /** Column definitions, in display order. */
  readonly columns: ReadonlyArray<DataTableColumn<T>>;
  /** Extracts a stable key for a row. */
  readonly rowKey: (row: T) => string;
  /** Replaces the body with a loading placeholder. */
  readonly loading?: boolean;
  /** Replaces the body with an error state. */
  readonly error?: unknown;
  /** Retries after an error. */
  readonly onRetry?: () => void;
  /** Heading for the empty state. */
  readonly emptyTitle?: string;
  /** Body text for the empty state. */
  readonly emptyDescription?: string;
  /** Action offered in the empty state. */
  readonly emptyAction?: React.ReactNode;
  /** Enables row selection with checkboxes. */
  readonly selectable?: boolean;
  /** Controlled set of selected row keys. */
  readonly selectedKeys?: ReadonlySet<string>;
  /** Called when the selection changes. */
  readonly onSelectionChange?: (keys: ReadonlySet<string>) => void;
  /** Enables client-side pagination. */
  readonly paginated?: boolean;
  /** Rows per page when paginated. */
  readonly pageSize?: number;
  /** Called when a row is activated. Makes rows interactive. */
  readonly onRowClick?: (row: T) => void;
  /** Reduces row height. */
  readonly dense?: boolean;
  /** Pins the header while the body scrolls. */
  readonly stickyHeader?: boolean;
  /** Word describing the rows, used in the pagination summary. */
  readonly itemLabel?: string;
  readonly className?: string;
}

/**
 * A sortable, selectable, paginated table.
 *
 * @param props - Rows, columns, and behaviour flags.
 * @returns The data table element.
 *
 * @example
 * <DataTable
 *   rows={invoices}
 *   rowKey={(row) => row.id}
 *   columns={[
 *     { id: "number", header: "Invoice", cell: (row) => row.number, sortValue: (row) => row.number },
 *     { id: "total", header: "Total", cell: (row) => formatCurrency(row.total), numeric: true },
 *   ]}
 *   paginated
 *   selectable
 * />
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  paginated = false,
  pageSize = 25,
  onRowClick,
  dense = false,
  stickyHeader = false,
  itemLabel = "rows",
  className,
}: DataTableProps<T>): React.JSX.Element {
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [internalSelection, setInternalSelection] = useState<ReadonlySet<string>>(new Set());

  const selection = selectedKeys ?? internalSelection;

  const updateSelection = useCallback(
    (next: ReadonlySet<string>) => {
      if (selectedKeys === undefined) setInternalSelection(next);
      onSelectionChange?.(next);
    },
    [selectedKeys, onSelectionChange],
  );

  const sortedRows = useMemo(() => {
    if (!sortColumnId) return rows;

    const column = columns.find((entry) => entry.id === sortColumnId);
    if (!column?.sortValue) return rows;

    return sortBy(rows, column.sortValue, sortDirection);
  }, [rows, columns, sortColumnId, sortDirection]);

  const pagination = usePagination({
    totalItems: sortedRows.length,
    defaultPageSize: pageSize,
  });

  const visibleRows = useMemo(
    () =>
      paginated
        ? sortedRows.slice(pagination.startIndex, pagination.startIndex + pagination.pageSize)
        : sortedRows,
    [paginated, sortedRows, pagination.startIndex, pagination.pageSize],
  );

  const toggleSort = useCallback(
    (columnId: string) => {
      if (sortColumnId !== columnId) {
        setSortColumnId(columnId);
        setSortDirection("asc");
        return;
      }

      // Third press clears the sort rather than cycling back to ascending, so
      // the original order remains reachable.
      if (sortDirection === "asc") {
        setSortDirection("desc");
        return;
      }

      setSortColumnId(null);
    },
    [sortColumnId, sortDirection],
  );

  const visibleKeys = useMemo(() => visibleRows.map(rowKey), [visibleRows, rowKey]);
  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selection.has(key));
  const someVisibleSelected = visibleKeys.some((key) => selection.has(key));

  const toggleAll = useCallback(() => {
    const next = new Set(selection);

    if (allVisibleSelected) {
      for (const key of visibleKeys) next.delete(key);
    } else {
      for (const key of visibleKeys) next.add(key);
    }

    updateSelection(next);
  }, [selection, allVisibleSelected, visibleKeys, updateSelection]);

  const toggleRow = useCallback(
    (key: string) => {
      const next = new Set(selection);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      updateSelection(next);
    },
    [selection, updateSelection],
  );

  const columnCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cn("space-y-3", className)}>
      <Table dense={dense} stickyHeader={stickyHeader}>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label={allVisibleSelected ? "Deselect all rows" : "Select all rows"}
                />
              </TableHead>
            ) : null}

            {columns.map((column) => (
              <TableHead
                key={column.id}
                numeric={column.numeric}
                style={column.width ? { width: column.width } : undefined}
                sorted={
                  (sortColumnId === column.id ? sortDirection : false) satisfies SortState
                }
                onSort={column.sortValue ? () => toggleSort(column.id) : undefined}
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="py-6">
                <SkeletonText lines={4} label="Loading table data" />
              </TableCell>
            </TableRow>
          ) : error !== undefined && error !== null ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <ErrorState error={error} onRetry={onRetry} compact />
              </TableCell>
            </TableRow>
          ) : visibleRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  compact
                />
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row, index) => {
              const key = rowKey(row);
              const isSelected = selection.has(key);

              return (
                <TableRow
                  key={key}
                  selected={isSelected}
                  interactive={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable ? (
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(key)}
                        aria-label={`Select row ${index + 1}`}
                      />
                    </TableCell>
                  ) : null}

                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      numeric={column.numeric}
                      className={column.className}
                    >
                      {column.cell(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {paginated && !loading && sortedRows.length > 0 ? (
        <Pagination
          pagination={pagination}
          totalItems={sortedRows.length}
          itemLabel={itemLabel}
          showPageSize
        />
      ) : null}
    </div>
  );
}
