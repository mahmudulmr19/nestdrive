"use client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn
} from "@nestdrive/ui";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { useMemo, useState } from "react";

export type { ColumnDef };

type ClientPaginationConfig = {
  /** Rows per page. Default: 10 */
  pageSize?: number;
};

type ServerPaginationConfig = {
  pageSize: number;
  /** 0-based page index */
  pageIndex: number;
  pageCount: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
};

type PaginationConfig = ClientPaginationConfig | ServerPaginationConfig;

function isServerPagination(p: PaginationConfig): p is ServerPaginationConfig {
  return (
    "total" in p &&
    "onPageChange" in p &&
    typeof (p as ServerPaginationConfig).onPageChange === "function"
  );
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  className?: string;
  /** Enable sortable column headers. Default: true */
  sortable?: boolean;
  /** Show loading state (skeleton rows). When true, data is ignored. */
  loading?: boolean;
  /** Show error state. When set, data is ignored. string or Error. */
  error?: string | Error | null;
  /** Client-side: true | { pageSize }. Server-side: { pageSize, pageIndex, pageCount, total, onPageChange }. Default: false */
  pagination?: boolean | PaginationConfig;
};

const SKELETON_ROW_KEYS = [
  "data-table-skeleton-1",
  "data-table-skeleton-2",
  "data-table-skeleton-3",
  "data-table-skeleton-4",
  "data-table-skeleton-5",
] as const;
const SKELETON_WIDTHS = ["90%", "70%", "85%", "60%", "75%"] as const;

const DEFAULT_PAGE_SIZE = 10;

function DataTable<TData>({
  columns,
  data,
  className,
  sortable = true,
  loading = false,
  error = null,
  pagination: paginationProp = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const paginationEnabled = Boolean(paginationProp);
  const serverPagination =
    typeof paginationProp === "object" && isServerPagination(paginationProp);
  const clientPagination =
    paginationEnabled &&
    typeof paginationProp === "object" &&
    !serverPagination;

  const pageSize =
    typeof paginationProp === "object" && paginationProp?.pageSize != null
      ? paginationProp.pageSize
      : DEFAULT_PAGE_SIZE;
  const [clientPaginationState, setClientPagination] =
    useState<PaginationState>(() => ({
      pageIndex: 0,
      pageSize,
    }));

  const tableData = loading || error ? [] : data;

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      ...(clientPagination && { pagination: clientPaginationState }),
    },
    onSortingChange: setSorting,
    onPaginationChange: clientPagination ? setClientPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getPaginationRowModel: clientPagination
      ? getPaginationRowModel()
      : undefined,
    manualSorting: false,
    manualPagination: !!serverPagination,
    ...(serverPagination && { pageCount: paginationProp.pageCount }),
  });

  const errorMessage = error instanceof Error ? error.message : (error ?? null);

  const rowCount = tableData.length;
  const pageCount = serverPagination
    ? paginationProp.pageCount
    : clientPagination
      ? table.getPageCount()
      : 1;
  const currentPageIndex = serverPagination
    ? paginationProp.pageIndex
    : clientPagination
      ? table.getState().pagination.pageIndex
      : 0;
  const totalRows = serverPagination ? paginationProp.total : rowCount;
  const start = totalRows === 0 ? 0 : currentPageIndex * pageSize + 1;
  const end = Math.min((currentPageIndex + 1) * pageSize, totalRows);

  const canPreviousPage = currentPageIndex > 0;
  const canNextPage = currentPageIndex < pageCount - 1;
  const handlePrevious = () => {
    if (serverPagination) {
      paginationProp.onPageChange(currentPageIndex - 1);
    } else if (clientPagination) {
      table.previousPage();
    }
  };
  const handleNext = () => {
    if (serverPagination) {
      paginationProp.onPageChange(currentPageIndex + 1);
    } else if (clientPagination) {
      table.nextPage();
    }
  };

  return (
    <div
      data-slot="data-table"
      className={cn(
        "border-border bg-card w-full overflow-hidden rounded-lg border",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = sortable && header.column.getCanSort();
                const isSorted = header.column.getIsSorted();
                const disabled = loading;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      canSort &&
                        !disabled &&
                        "hover:text-foreground cursor-pointer select-none",
                      disabled && "pointer-events-none opacity-70",
                    )}
                    onClick={
                      canSort && !disabled
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {canSort && <SortIcon sorted={isSorted} />}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            SKELETON_ROW_KEYS.map((rowKey) => (
              <TableRow key={rowKey} className="hover:bg-transparent">
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={`${rowKey}-${String((col as { accessorKey?: string }).accessorKey ?? colIndex)}`}
                  >
                    <div
                      className="bg-muted/60 h-5 animate-pulse rounded"
                      style={{
                        width:
                          SKELETON_WIDTHS[colIndex % SKELETON_WIDTHS.length],
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-32 py-8 text-center"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-destructive/10 ring-destructive/20 flex size-11 items-center justify-center rounded-full ring-1">
                    <AlertCircle
                      className="text-destructive size-5"
                      aria-hidden
                    />
                  </div>
                  <p className="text-foreground text-sm font-semibold">
                    Something went wrong
                  </p>
                  <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-32 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {paginationEnabled && !loading && !errorMessage && pageCount > 1 && (
        <div className="border-border text-muted-foreground flex items-center justify-between gap-4 border-t px-4 py-3 text-sm">
          <p>
            Showing <span className="text-foreground font-medium">{start}</span>
            –<span className="text-foreground font-medium">{end}</span> of{" "}
            <span className="text-foreground font-medium">{totalRows}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canPreviousPage}
              aria-label="Previous page"
            >
              <ArrowLeft className="size-4" />
              Previous
            </Button>
            <span className="tabular-nums">
              Page {currentPageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canNextPage}
              aria-label="Next page"
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  const Icon = useMemo(() => {
    if (sorted === "asc") return ArrowUp;
    if (sorted === "desc") return ArrowDown;
    return ArrowUpDown;
  }, [sorted]);

  return (
    <Icon
      className={cn(
        "size-3.5 shrink-0 transition-opacity",
        sorted ? "text-primary opacity-100" : "opacity-50",
      )}
      aria-hidden
    />
  );
}

export { DataTable };
