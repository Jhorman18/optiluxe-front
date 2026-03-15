import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

/**
 * columns  : ColumnDef[]  (@tanstack/react-table)
 * pageSize : number       — enables built-in pagination when provided
 * initialSorting: { id, desc }[] — initial sort state
 * onRowClick: (row) => void  — row click handler
 * Column meta fields:
 *   meta.headerClassName — extra className on <th>
 *   meta.tdClassName     — extra className on <td>
 *   meta.skeletonClass   — skeleton div className (default "h-6 w-24")
 *   meta.stopPropagation — calls e.stopPropagation() on <td> click
 */
export default function DataTable({
    columns,
    data,
    loading,
    emptyMessage = "No se encontraron registros.",
    skeletonRows = 5,
    cellPadding = "px-6 py-4",
    pageSize,
    initialSorting,
    header,
    renderEmpty,
    onRowClick,
}) {
    const [sorting, setSorting] = useState(initialSorting ?? []);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize ?? 10 });

    const table = useReactTable({
        data: data ?? [],
        columns,
        state: {
            sorting,
            ...(pageSize ? { pagination } : {}),
        },
        onSortingChange: setSorting,
        ...(pageSize ? { onPaginationChange: setPagination } : {}),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        ...(pageSize ? { getPaginationRowModel: getPaginationRowModel() } : {}),
        autoResetPageIndex: true,
    });

    const leafColumns = table.getAllLeafColumns();
    const colSpan = leafColumns.length;

    const defaultSkeleton = (i) => (
        <tr key={i} className="animate-pulse">
            {leafColumns.map((col, j) => (
                <td key={j} className={cellPadding}>
                    <div className={`bg-slate-100 rounded ${col.columnDef.meta?.skeletonClass ?? "h-6 w-24"}`} />
                </td>
            ))}
        </tr>
    );

    const defaultEmpty = () => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-500 font-medium">
                {emptyMessage}
            </td>
        </tr>
    );

    const rows = table.getRowModel().rows;
    const totalRows = (data ?? []).length;
    const pageState = table.getState().pagination;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {header}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();
                                    return (
                                        <th
                                            key={header.id}
                                            className={`${cellPadding} text-xs font-bold text-slate-500 uppercase tracking-wider ${canSort ? "cursor-pointer hover:bg-slate-100 transition select-none" : ""} ${header.column.columnDef.meta?.headerClassName ?? ""}`}
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                        >
                                            {canSort ? (
                                                <div className="flex items-center">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {sorted === "asc"
                                                        ? <FaSortUp className="text-blue-600 ml-1" />
                                                        : sorted === "desc"
                                                        ? <FaSortDown className="text-blue-600 ml-1" />
                                                        : <FaSort className="text-slate-300 ml-1" />}
                                                </div>
                                            ) : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: skeletonRows }, (_, i) => defaultSkeleton(i))
                        ) : rows.length === 0 ? (
                            renderEmpty ? renderEmpty() : defaultEmpty()
                        ) : (
                            rows.map(row => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-slate-50 transition ${onRowClick ? "cursor-pointer" : ""}`}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className={`${cellPadding} ${cell.column.columnDef.meta?.tdClassName ?? ""}`}
                                            onClick={cell.column.columnDef.meta?.stopPropagation ? e => e.stopPropagation() : undefined}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {pageSize && !loading && totalRows > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
                    <p>
                        Mostrando {pageState.pageIndex * pageSize + 1}–{Math.min((pageState.pageIndex + 1) * pageSize, totalRows)} de {totalRows} registro{totalRows !== 1 ? "s" : ""}
                    </p>
                    {table.getPageCount() > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Anterior
                            </button>
                            {(() => {
                                const total = table.getPageCount();
                                const current = pageState.pageIndex;
                                const maxVisible = 5;
                                let start = Math.max(0, current - Math.floor(maxVisible / 2));
                                let end = Math.min(total - 1, start + maxVisible - 1);
                                if (end - start + 1 < maxVisible) start = Math.max(0, end - maxVisible + 1);
                                return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pageIdx => (
                                    <button
                                        key={pageIdx}
                                        onClick={() => table.setPageIndex(pageIdx)}
                                        className={`w-9 h-9 rounded-lg font-bold text-sm transition cursor-pointer ${pageIdx === current
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {pageIdx + 1}
                                    </button>
                                ));
                            })()}
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
