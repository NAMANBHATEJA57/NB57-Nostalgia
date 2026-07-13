"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Filter, BoxSelect, Loader2, Heart } from "lucide-react";
import { useInterestedItems } from '@/components/context/InterestedItemsContext';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCollectionItems } from '@/actions/collection';

export function CollectionClient({ 
  initialItems,
  initialHasMore,
  filterOptions,
  initialFilter,
  initialCondition,
  initialSearch
}: { 
  initialItems: any[];
  initialHasMore: boolean;
  filterOptions: { categories: string[], statuses: string[], conditions: string[] };
  initialFilter?: string;
  initialCondition?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { items: interestedItems, addItem, removeItem, isInterested } = useInterestedItems();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [search, setSearch] = useState(initialSearch || "");
  const [categoryFilter, setCategoryFilter] = useState<string[]>(initialFilter && initialFilter !== 'sealed' ? [initialFilter] : []);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [conditionFilter, setConditionFilter] = useState<string[]>(initialCondition ? [initialCondition] : []);
  
  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('q', search);
      } else {
        params.delete('q');
      }
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  // When props update (from URL change), reset items
  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialItems, initialHasMore]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      
      // Construct filter object same as page.tsx does internally
      const filters: any = { search };
      if (categoryFilter.length > 0) filters.category = categoryFilter;
      if (statusFilter.length > 0) filters.status = statusFilter;
      if (conditionFilter.length > 0) filters.condition = conditionFilter;

      const { items: newItems, hasMore: more } = await getCollectionItems(nextPage, filters);
      setItems(prev => [...prev, ...newItems]);
      setHasMore(more);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter([]);
    setStatusFilter([]);
    setConditionFilter([]);
    router.push(pathname);
  };

  // We perform local filtering for instant feedback, but we also fetch from the server
  // to ensure we get items that might be on page 2+
  const filteredItems = items.filter((item: any) => {
    const catName = item.category?.name || 'Uncategorized';
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(catName) || categoryFilter.includes(catName.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.availability);
    const matchesCondition = conditionFilter.length === 0 || conditionFilter.includes(item.condition);

    return matchesCategory && matchesStatus && matchesCondition;
  });

  useEffect(() => {
    // Skip the initial mount fetch since we have initialItems
    if (categoryFilter.length === (initialFilter && initialFilter !== 'sealed' ? 1 : 0) &&
        statusFilter.length === 0 &&
        conditionFilter.length === (initialCondition ? 1 : 0) &&
        search === (initialSearch || "")) {
      return;
    }

    const fetchFiltered = async () => {
      startTransition(async () => {
        const filters: any = { search };
        if (categoryFilter.length > 0) filters.category = categoryFilter;
        if (statusFilter.length > 0) filters.status = statusFilter;
        if (conditionFilter.length > 0) filters.condition = conditionFilter;

        const { items: newItems, hasMore: more } = await getCollectionItems(1, filters);
        setItems(newItems);
        setHasMore(more);
        setPage(1);
      });
    };

    const timer = setTimeout(fetchFiltered, 300);
    return () => clearTimeout(timer);
  }, [categoryFilter, statusFilter, conditionFilter, search]);

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
          {isPending && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className={`${buttonVariants({ variant: "outline" })} h-12 rounded-full px-6 bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-colors`}>
            <Filter className="mr-2 h-4 w-4" />
            Filters {(categoryFilter.length > 0 || statusFilter.length > 0 || conditionFilter.length > 0) && <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0">{categoryFilter.length + statusFilter.length + conditionFilter.length}</Badge>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 max-h-96 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Status</DropdownMenuLabel>
              {filterOptions.statuses.map(status => (
                <DropdownMenuCheckboxItem 
                  key={status} 
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) setStatusFilter([...statusFilter, status]);
                    else setStatusFilter(statusFilter.filter(s => s !== status));
                  }}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg cursor-pointer"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {filterOptions.statuses.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Collection</DropdownMenuLabel>
              {filterOptions.categories.map(category => (
                <DropdownMenuCheckboxItem 
                  key={category} 
                  checked={categoryFilter.includes(category) || categoryFilter.includes(category.toLowerCase())}
                  onCheckedChange={(checked) => {
                    if (checked) setCategoryFilter([...categoryFilter, category]);
                    else setCategoryFilter(categoryFilter.filter(c => c !== category && c !== category.toLowerCase()));
                  }}
                  onSelect={(e) => e.preventDefault()}
                  className="rounded-lg cursor-pointer"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {filterOptions.conditions.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-medium text-slate-500 text-xs uppercase tracking-wider">Condition</DropdownMenuLabel>
                  {filterOptions.conditions.map((condition: any) => (
                    <DropdownMenuCheckboxItem 
                      key={condition} 
                      checked={conditionFilter.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) setConditionFilter([...conditionFilter, condition]);
                        else setConditionFilter(conditionFilter.filter(c => c !== condition));
                      }}
                      onSelect={(e) => e.preventDefault()}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item: any) => (
            <Link prefetch={true} href={`/collection/${item.slug}`} key={item.id} className="group flex flex-col cursor-pointer rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="aspect-square relative bg-slate-100 w-full overflow-hidden">
                <Image 
                  src={item.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                  alt={item.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
                
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  {mounted && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInterested(item.id)) {
                          removeItem(item.id);
                        } else {
                          addItem({
                            id: item.id,
                            slug: item.slug,
                            name: item.name,
                            sku: item.sku || `NB57-${item.id.slice(-6).toUpperCase()}`,
                            condition: item.condition,
                            availability: item.availability,
                            askingPrice: item.askingPrice || 0,
                            image: item.coverImage || undefined
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm group/heart"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isInterested(item.id) ? 'fill-red-500 text-red-500' : 'text-slate-500 group-hover/heart:text-red-500'}`} />
                    </button>
                  )}
                </div>

                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {item.sealed ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-0.5 text-xs font-medium backdrop-blur-sm bg-amber-100/90 shadow-sm">Factory Sealed</Badge>
                  ) : item.condition ? (
                    <Badge className="bg-white/90 text-slate-700 border-slate-200 px-2 py-0.5 text-xs font-medium backdrop-blur-sm shadow-sm">{item.condition}</Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col flex-1 p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{item.category?.name || 'Uncategorized'}</div>
                  {item.availability === 'Sold' ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100">Sold</Badge>
                  ) : item.availability === 'Reserved' ? (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Reserved</Badge>
                  ) : (item.availability === 'Not For Sale' || item.availability === 'Not for Sale') ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">Not For Sale</Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Available</Badge>
                  )}
                </div>
                <h3 className="font-medium text-lg leading-snug line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                <div className="flex justify-between items-center pt-2 mt-auto">
                  <span className="text-sm text-slate-500">{item.condition}</span>
                  <span className="font-medium text-slate-900">{item.askingPrice ? `₹${item.askingPrice.toLocaleString('en-IN')}` : 'Request'}</span>
                </div>
              </div>
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
              onClick={handleClearFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-10 h-14 border-slate-300"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoadingMore ? "Loading..." : "Load More Items"}
          </Button>
        </div>
      )}
    </>
  );
}
