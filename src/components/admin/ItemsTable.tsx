"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteItem, deleteItems, duplicateItem } from "@/app/admin/items/actions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
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

  const categories = allCategories || Array.from(new Set(items.map(item => item.category?.name || 'Uncategorized')));
  const statuses = ['Available', 'Reserved', 'Sold', 'Not for Sale'];
  const conditions = Array.from(new Set(items.map(item => item.condition))).filter(Boolean) as string[];

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
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between gap-4 bg-slate-50/50 rounded-t-xl shrink-0">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Name, SKU, Category..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
             <div className="flex items-center gap-2 mr-4 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md">
                <span className="font-medium">{selectedIds.length} selected</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 py-0 hover:bg-primary/20 hover:text-primary">Bulk Edit</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 py-0 hover:bg-red-200 hover:text-red-700 text-red-600"
                  onClick={() => setDeleteDialog({ open: true, type: 'bulk' })}
                  disabled={isPending}
                >
                  Delete
                </Button>
             </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Filter className="mr-2 h-4 w-4" />
              Filters {(categoryFilter.length > 0 || statusFilter.length > 0 || conditionFilter.length > 0) && `(${categoryFilter.length + statusFilter.length + conditionFilter.length})`}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                {statuses.map(status => (
                  <DropdownMenuCheckboxItem 
                    key={status} 
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) setStatusFilter([...statusFilter, status]);
                      else setStatusFilter(statusFilter.filter(s => s !== status));
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              {statuses.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                {categories.map(category => (
                  <DropdownMenuCheckboxItem 
                    key={category} 
                    checked={categoryFilter.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) setCategoryFilter([...categoryFilter, category]);
                      else setCategoryFilter(categoryFilter.filter(c => c !== category));
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              {conditions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Filter by Condition</DropdownMenuLabel>
                    {conditions.map(condition => (
                      <DropdownMenuCheckboxItem 
                        key={condition} 
                        checked={conditionFilter.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) setConditionFilter([...conditionFilter, condition]);
                          else setConditionFilter(conditionFilter.filter(c => c !== condition));
                        }}
                      >
                        {condition}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
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
                    <Badge variant={item.availability === "Sold" ? "destructive" : item.availability === "Available" ? "default" : "secondary"}>
                      {item.availability}
                    </Badge>
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

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isPending && setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'bulk' 
                ? `This action cannot be undone. This will permanently delete ${selectedIds.length} items from the database.`
                : `This action cannot be undone. This will permanently delete the item from the database.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (deleteDialog.type === 'bulk') {
                  handleBulkDelete();
                } else if (deleteDialog.itemId) {
                  handleDelete(deleteDialog.itemId);
                }
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
