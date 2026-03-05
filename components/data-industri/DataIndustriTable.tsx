import { useEffect, useRef } from "react";
import {
    flexRender,
    type PaginationState,
    type Table,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
    PAGE_SIZE_OPTIONS,
    type IndustryRow,
} from "@/components/data-industri/types";

interface DataIndustriTableProps {
    table: Table<IndustryRow>;
    filteredCount: number;
    pagination: PaginationState;
    onRowClick: (row: IndustryRow) => void;
}

export default function DataIndustriTable({
    table,
    filteredCount,
    pagination,
    onRowClick,
}: DataIndustriTableProps) {
    const rows = table.getRowModel().rows;
    const tableRef = useRef<HTMLDivElement>(null);
    const resizedRef = useRef(false);
    const rowCount = rows.length;
    const pageCount = table.getPageCount();
    const currentPage = pagination.pageIndex;
    const maxNumericButtons = 4;

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => tableRef.current,
        estimateSize: () => 44,
        overscan: 8,
        measureElement: (element) => element?.getBoundingClientRect().height,
        getItemKey: (index) => rows[index]?.id ?? index,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? rowVirtualizer.getTotalSize() -
              virtualRows[virtualRows.length - 1].end
            : 0;

    useEffect(() => {
        if (rowCount === 0) return;
        rowVirtualizer.scrollToIndex(0);
        // react-virtual instance is not stable for exhaustive-deps in this setup
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize, rowCount]);

    const columnCount = table.getVisibleLeafColumns().length;

    const pageButtons: Array<number | "..."> = (() => {
        if (pageCount <= maxNumericButtons) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }

        const currentPageNumber = currentPage + 1;

        if (currentPageNumber <= 3) {
            return [1, 2, 3, 4, "..."];
        }

        if (currentPageNumber >= pageCount - 2) {
            return [
                "...",
                pageCount - 3,
                pageCount - 2,
                pageCount - 1,
                pageCount,
            ];
        }

        return [
            "...",
            currentPageNumber - 1,
            currentPageNumber,
            currentPageNumber + 1,
            currentPageNumber + 2,
            "...",
        ];
    })();

    return (
        <section className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
            <div
                ref={tableRef}
                className="overflow-auto"
                style={{
                    height: "min(58dvh, 560px)",
                    maxHeight: "min(58dvh, 560px)",
                    contain: "strict",
                    willChange: "scroll-position",
                }}
            >
                <table
                    className="table table-sm border-separate border-spacing-0"
                    style={{
                        width: `${table.getTotalSize()}px`,
                        tableLayout: "fixed",
                    }}
                >
                    <thead className="sticky top-0 z-10 bg-base-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={
                                            header.column.getCanSort()
                                                ? "relative select-none"
                                                : ""
                                        }
                                        style={{
                                            position: "relative",
                                            width: header.getSize(),
                                        }}
                                    >
                                        <div
                                            className={
                                                header.column.getCanSort()
                                                    ? "flex items-center gap-1 cursor-pointer"
                                                    : "flex items-center gap-1"
                                            }
                                            onClick={
                                                header.column.getCanSort()
                                                    ? () => {
                                                          if (
                                                              resizedRef.current
                                                          ) {
                                                              resizedRef.current = false;
                                                              return;
                                                          }
                                                          header.column.toggleSorting();
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                            {header.column.getIsSorted() ===
                                            "asc" ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : header.column.getIsSorted() ===
                                              "desc" ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ArrowUpDown className="h-4 w-4 opacity-40" />
                                            )}
                                        </div>

                                        {header.column.getCanResize() && (
                                            <div
                                                role="separator"
                                                aria-label={`Resize ${String(header.column.columnDef.header)}`}
                                                draggable={false}
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                                onMouseUp={(event) =>
                                                    event.stopPropagation()
                                                }
                                                onDoubleClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                                onMouseDown={(event) => {
                                                    event.stopPropagation();
                                                    resizedRef.current = true;
                                                    header.getResizeHandler()(
                                                        event,
                                                    );
                                                }}
                                                onTouchStart={(event) => {
                                                    event.stopPropagation();
                                                    resizedRef.current = true;
                                                    header.getResizeHandler()(
                                                        event,
                                                    );
                                                }}
                                                className={`absolute -right-1 top-0 h-full w-3 cursor-col-resize touch-none select-none ${header.column.getIsResizing() ? "bg-primary/40" : "hover:bg-base-content/20"}`}
                                            />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {paddingTop > 0 && (
                            <tr>
                                <td
                                    style={{ height: `${paddingTop}px` }}
                                    colSpan={columnCount}
                                />
                            </tr>
                        )}

                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            if (!row) return null;

                            return (
                                <tr
                                    key={row.id}
                                    ref={rowVirtualizer.measureElement}
                                    data-index={virtualRow.index}
                                    className={
                                        !row.original.isInsideKaranganyar
                                            ? "bg-warning/20 border-y border-warning/30 hover:bg-warning/25"
                                            : "hover:bg-base-200/70"
                                    }
                                    onClick={() => onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                width: `${cell.column.getSize()}px`,
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}

                        {paddingBottom > 0 && (
                            <tr>
                                <td
                                    style={{ height: `${paddingBottom}px` }}
                                    colSpan={columnCount}
                                />
                            </tr>
                        )}
                    </tbody>
                </table>

                {rows.length === 0 && (
                    <div className="flex h-24 items-center justify-center text-sm text-base-content/60">
                        Tidak ada data untuk ditampilkan.
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 border-t border-base-300 bg-base-200/40 px-3 py-3 sm:px-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-base-content/70">
                    Menampilkan{" "}
                    {filteredCount === 0
                        ? 0
                        : pagination.pageIndex * pagination.pageSize + 1}
                    -
                    {Math.min(
                        (pagination.pageIndex + 1) * pagination.pageSize,
                        filteredCount,
                    )}{" "}
                    dari {filteredCount}
                </div>

                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            className="select select-bordered select-sm w-full sm:w-auto"
                            value={pagination.pageSize}
                            onChange={(event) => {
                                table.setPageSize(Number(event.target.value));
                                table.setPageIndex(0);
                            }}
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>

                        <div className="join w-full overflow-x-auto sm:w-auto self-end md:self-auto">
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                aria-label="Halaman pertama"
                            >
                                {"<<"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                aria-label="Halaman sebelumnya"
                            >
                                {"<"}
                            </button>
                            {pageButtons.map((page, index) =>
                                page === "..." ? (
                                    <button
                                        key={`ellipsis-${index}`}
                                        type="button"
                                        className="btn btn-sm btn-disabled join-item"
                                        disabled
                                    >
                                        ...
                                    </button>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        className={`btn btn-sm join-item ${page - 1 === currentPage ? "btn-primary" : "btn-outline"}`}
                                        onClick={() =>
                                            table.setPageIndex(page - 1)
                                        }
                                    >
                                        {page}
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                aria-label="Halaman berikutnya"
                            >
                                {">"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                onClick={() =>
                                    table.setPageIndex(
                                        Math.max(pageCount - 1, 0),
                                    )
                                }
                                disabled={!table.getCanNextPage()}
                                aria-label="Halaman terakhir"
                            >
                                {">>"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
