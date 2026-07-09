"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemsTableToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  selectedIdsLength: number;
  isPending: boolean;
  onBulkDeleteClick: () => void;
  
  categoryFilter: string[];
  setCategoryFilter: (v: string[]) => void;
  categories: string[];
  
  statusFilter: string[];
  setStatusFilter: (v: string[]) => void;
  statuses: string[];
  
  conditionFilter: string[];
  setConditionFilter: (v: string[]) => void;
  conditions: string[];
}

export function ItemsTableToolbar({
  search, setSearch, selectedIdsLength, isPending, onBulkDeleteClick,
  categoryFilter, setCategoryFilter, categories,
  statusFilter, setStatusFilter, statuses,
  conditionFilter, setConditionFilter, conditions
}: ItemsTableToolbarProps) {
  return (
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
        {selectedIdsLength > 0 && (
           <div className="flex items-center gap-2 mr-4 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md">
              <span className="font-medium">{selectedIdsLength} selected</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 py-0 hover:bg-primary/20 hover:text-primary">Bulk Edit</Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 py-0 hover:bg-red-200 hover:text-red-700 text-red-600"
                onClick={onBulkDeleteClick}
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
  );
}
