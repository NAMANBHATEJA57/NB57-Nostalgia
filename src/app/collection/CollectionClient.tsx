"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Filter, BoxSelect } from "lucide-react";
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
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate short loading for skeleton effect
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const categories = Array.from(new Set(items.map((item: any) => item.category?.name || 'Uncategorized')));
  const statuses = Array.from(new Set(items.map((item: any) => item.availability).filter(Boolean)));
  const conditions = Array.from(new Set(items.map((item: any) => item.condition).filter(Boolean)));

  // Handle URL filters initially
  useEffect(() => {
    if (filter) {
      if (filter === 'sealed') {
        // Special case for sealed? Wait, sealed is a boolean.
      } else {
        // Find category match (case insensitive)
        const cat = categories.find(c => c.toLowerCase() === filter.toLowerCase());
        if (cat) setCategoryFilter([cat]);
      }
    }
  }, [filter]); // add filter as dependency but categories is stable enough

  const filteredItems = items.filter((item: any) => {
    // Check if filtering by sealed
    const matchesSpecialFilter = filter === 'sealed' ? item.sealed === true : true;

    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description?.toLowerCase().includes(search.toLowerCase());
    
    const catName = item.category?.name || 'Uncategorized';
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(catName);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.availability);
    const matchesCondition = conditionFilter.length === 0 || conditionFilter.includes(item.condition);

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition && matchesSpecialFilter;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by item, character, brand..." 
            className="pl-11 h-12 bg-white rounded-full border-slate-200 shadow-sm hover:border-slate-300 focus-visible:ring-slate-300 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className={`${buttonVariants({ variant: "outline" })} h-12 rounded-full px-6 bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-colors`}>
            <Filter className="mr-2 h-4 w-4" />
            Filters {(categoryFilter.length > 0 || statusFilter.length > 0 || conditionFilter.length > 0) && <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0">{categoryFilter.length + statusFilter.length + conditionFilter.length}</Badge>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Status</DropdownMenuLabel>
              {statuses.map(status => (
                <DropdownMenuCheckboxItem 
                  key={status} 
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) setStatusFilter([...statusFilter, status]);
                    else setStatusFilter(statusFilter.filter(s => s !== status));
                  }}
                  className="rounded-lg cursor-pointer"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {statuses.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Collection</DropdownMenuLabel>
              {categories.map(category => (
                <DropdownMenuCheckboxItem 
                  key={category} 
                  checked={categoryFilter.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) setCategoryFilter([...categoryFilter, category]);
                    else setCategoryFilter(categoryFilter.filter(c => c !== category));
                  }}
                  className="rounded-lg cursor-pointer"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {conditions.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Condition</DropdownMenuLabel>
                  {conditions.map((condition: any) => (
                    <DropdownMenuCheckboxItem 
                      key={condition} 
                      checked={conditionFilter.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) setConditionFilter([...conditionFilter, condition]);
                        else setConditionFilter(conditionFilter.filter(c => c !== condition));
                      }}
                      className="rounded-lg cursor-pointer"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          // Skeletons
          [...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col h-full rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-full bg-slate-200 rounded mt-4"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item: any) => (
            <Link href={`/collection/${item.slug}`} key={item.id} className="group h-full cursor-pointer">
              <Card className="h-full flex flex-col overflow-hidden bg-white border border-slate-100/80 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-900/5 group-hover:ring-1 group-hover:ring-blue-100 rounded-2xl pt-0">
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <Image 
                    src={item.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {item.sealed && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-0.5 text-xs font-medium backdrop-blur-sm bg-amber-100/90">Factory Sealed</Badge>
                    </div>
                  )}
                  {item.condition && !item.sealed && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200/50 px-2 py-0.5 font-medium shadow-sm">
                        {item.condition}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    {item.availability === 'Sold' ? (
                      <Badge variant="secondary" className="bg-slate-800/80 backdrop-blur-sm text-white border-transparent px-2 py-0.5 font-medium shadow-sm">Sold</Badge>
                    ) : item.availability === 'Reserved' ? (
                      <Badge variant="secondary" className="bg-yellow-500/80 backdrop-blur-sm text-white border-transparent px-2 py-0.5 font-medium shadow-sm">Reserved</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-500/80 backdrop-blur-sm text-white border-transparent px-2 py-0.5 font-medium shadow-sm">Available</Badge>
                    )}
                  </div>
                </div>
                
                <CardHeader className="p-5 pb-3">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">{item.category?.name || 'Uncategorized'}</div>
                  <h3 className="font-cormorant text-2xl font-bold leading-tight line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{item.name}</h3>
                </CardHeader>
                
                <CardFooter className="p-5 pt-3 mt-auto flex justify-between items-center bg-slate-50/50 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Fair Value</span>
                    <span className="font-medium text-slate-900 text-sm">
                      {item.askingPrice ? `₹${item.askingPrice.toLocaleString('en-IN')}` : 'Request'}
                    </span>
                  </div>
                  <div className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    <BoxSelect className="w-5 h-5" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="font-cormorant text-3xl font-bold text-slate-900 mb-3">No collectibles found</h3>
            <p className="text-slate-500 max-w-sm font-light">
              We couldn't find any items matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <Button 
              variant="outline" 
              className="mt-8 rounded-full px-8 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setSearch("");
                setCategoryFilter([]);
                setStatusFilter([]);
                setConditionFilter([]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
