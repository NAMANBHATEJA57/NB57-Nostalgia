"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/constants";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: Date;
  customer: { name: string; phone: string | null };
  _count: { items: number };
}

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Partial: "bg-blue-50 text-blue-700",
  Draft: "bg-slate-100 text-slate-600",
  Cancelled: "bg-red-50 text-red-700",
};

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <Link
        href={`/admin/invoices/${row.original.id}`}
        className="font-mono text-sm font-medium text-foreground hover:text-accent inline-flex items-center gap-1"
      >
        {row.original.invoiceNumber}
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </Link>
    ),
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.customer.name}</p>
        {row.original.customer.phone && (
          <p className="text-xs text-muted-foreground">{row.original.customer.phone}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "_count.items",
    header: "Items",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original._count.items}</span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold tabular-nums">{formatCurrency(row.original.grandTotal)}</span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[row.original.paymentStatus] || ""}`}>
        {row.original.paymentStatus}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.paymentMethod || "–"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/admin/invoices/${row.original.id}`}>
        <Button variant="ghost" className="h-8 px-2 text-xs">
          View
        </Button>
      </Link>
    ),
  },
];

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.invoiceNumber.toLowerCase().includes(search) ||
        row.original.customer.name.toLowerCase().includes(search) ||
        row.original.paymentStatus.toLowerCase().includes(search)
      );
    },
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-medium text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {table.getFilteredRowModel().rows.length} invoice(s)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-8 px-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="ghost"
            className="h-8 px-2"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
