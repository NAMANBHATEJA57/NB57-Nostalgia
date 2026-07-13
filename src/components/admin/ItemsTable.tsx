"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deleteItem, deleteItems, duplicateItem, updateItemStatus } from "@/app/admin/items/actions";
import { sortAlphabetically, sortConditions } from "@/lib/sort";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Edit, Trash, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemsTableToolbar } from "./ItemsTableToolbar";
import { ItemsTableDeleteDialog } from "./ItemsTableDeleteDialog";

type ItemTableRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  coverImage: string;
  availability: string;
  condition: string;
  askingPrice: number | null;
  fairValueMax?: number | null;
  series?: string | null;
  sealed: boolean;
  featured: boolean;
  createdAt: Date;
  category: { name: string } | null;
};

interface ItemsTableProps {
  items: ItemTableRow[];
  allCategories?: string[];
}

export function ItemsTable({ items: initialItems, allCategories }: ItemsTableProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, type: 'single' | 'bulk', itemId?: string }>({ open: false, type: 'single' });

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const result = await duplicateItem(id);
      if (result.success && result.item) {
        toast.success("Item duplicated successfully");
        setItems([result.item as ItemTableRow, ...items]);
      } else {
        toast.error(result.error || "Failed to duplicate item");
      }
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const previousItems = [...items];
    setItems(prev => prev.map(item => item.id === id ? { ...item, availability: newStatus } : item));
    
    startTransition(async () => {
      const result = await updateItemStatus(id, newStatus);
      if (result.success) {
        toast.success("Status updated");
      } else {
        toast.error(result.error || "Failed to update status");
        setItems(previousItems);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteItem(id);
      if (result.success) {
        toast.success("Item deleted successfully");
        setItems(items.filter(item => item.id !== id));
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        setDeleteDialog(prev => ({ ...prev, open: false }));
      } else {
        toast.error(result.error || "Failed to delete item");
      }
    });
  };

  const handleBulkDelete = () => {
    startTransition(async () => {
      const result = await deleteItems(selectedIds);
      if (result.success) {
        toast.success("Items deleted successfully");
        setItems(items.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setDeleteDialog(prev => ({ ...prev, open: false }));
      } else {
        toast.error(result.error || "Failed to delete items");
      }
    });
  };

  // Filter items client-side for now
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (item.category?.name || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(item.category?.name || '');
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.availability);
    const matchesCondition = conditionFilter.length === 0 || (item.condition && conditionFilter.includes(item.condition));

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  const categories = sortAlphabetically(allCategories || Array.from(new Set(items.map(item => item.category?.name || 'Uncategorized'))));
  const statuses = ['Available', 'Reserved', 'Sold', 'Not for Sale'];
  const conditions = sortConditions(Array.from(new Set(items.map(item => item.condition))).filter(Boolean) as string[]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "-";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm flex flex-col h-[calc(100vh-200px)]">
      <ItemsTableToolbar 
        search={search}
        setSearch={setSearch}
        selectedIdsLength={selectedIds.length}
        isPending={isPending}
        onBulkDeleteClick={() => setDeleteDialog({ open: true, type: 'bulk' })}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statuses={statuses}
        conditionFilter={conditionFilter}
        setConditionFilter={setConditionFilter}
        conditions={conditions}
      />
      
      {/* Table Area (Scrollable) */}
      <div className="overflow-auto flex-1 relative">
        <Table className="w-full text-sm">
          <TableHeader className="bg-slate-100 sticky top-0 z-10 shadow-sm">
            <TableRow className="hover:bg-slate-100">

              <TableHead className="w-16">Image</TableHead>
              <TableHead className="min-w-[120px]">Collection ID</TableHead>
              <TableHead className="min-w-[200px]">Item Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                  No items found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map(item => (
                <TableRow key={item.id} className="group">

                  <TableCell>
                    <div className="w-10 h-10 relative rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">
                      {item.coverImage ? (
                        <Image src={item.coverImage} alt={item.name} fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No img</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-medium text-slate-500">
                    {item.sku}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[150px]">
                    {item.series || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{item.condition}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(item.askingPrice)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPrice(item.fairValueMax ?? null)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select 
                      value={item.availability} 
                      onValueChange={(value) => handleStatusChange(item.id, value)}
                      disabled={isPending || item.availability === "Sold"}
                    >
                      <SelectTrigger className={`w-[120px] h-8 text-xs mx-auto border-transparent shadow-none [&>span]:line-clamp-1 ${
                        item.availability === "Sold" ? "bg-red-50 text-red-700 hover:bg-red-100" : 
                        item.availability === "Available" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : 
                        item.availability === "Reserved" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
                        "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleDuplicate(item.id)}
                        disabled={isPending}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/items/${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteDialog({ open: true, type: 'single', itemId: item.id })}
                        disabled={isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-slate-50 shrink-0 rounded-b-xl">
        <div>Showing {filteredItems.length} of {items.length} items</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>

      <ItemsTableDeleteDialog 
        open={deleteDialog.open}
        type={deleteDialog.type}
        itemId={deleteDialog.itemId}
        selectedIdsLength={selectedIds.length}
        isPending={isPending}
        onOpenChange={(open) => !isPending && setDeleteDialog({ ...deleteDialog, open })}
        onConfirmBulk={handleBulkDelete}
        onConfirmSingle={handleDelete}
      />
    </div>
  );
}
