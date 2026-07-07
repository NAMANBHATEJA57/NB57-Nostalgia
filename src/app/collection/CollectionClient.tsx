"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CollectionClient({ items }: { items: any[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const categories = Array.from(new Set(items.map((item: any) => item.category?.name || 'Uncategorized')));
  const statuses = Array.from(new Set(items.map((item: any) => item.availability)));

  const filteredItems = items.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description?.toLowerCase().includes(search.toLowerCase());
    
    const catName = item.category?.name || 'Uncategorized';
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(catName);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.availability);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search the collection..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
            <Filter className="mr-2 h-4 w-4" />
            Filters {(categoryFilter.length > 0 || statusFilter.length > 0) && `(${categoryFilter.length + statusFilter.length})`}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item: any) => (
          <Link href={`/collection/${item.slug}`} key={item.id}>
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group pt-0">
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.condition && (
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm">
                    {item.condition}
                  </Badge>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wider">{item.category?.name || 'Uncategorized'}</div>
                <h3 className="font-medium text-lg leading-tight line-clamp-2">{item.name}</h3>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-2 border-t flex justify-between items-center bg-slate-50/50 mt-auto">
                <div className="font-semibold text-slate-900">
                  {item.askingPrice ? `₹${item.askingPrice.toLocaleString('en-IN')}` : 'Price on Request'}
                </div>
                {item.sealed && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Sealed</Badge>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-24 text-muted-foreground">
            No items found matching your filters.
          </div>
        )}
      </div>
    </>
  );
}
