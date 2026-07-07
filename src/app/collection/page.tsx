import Navbar from '@/components/layout/Navbar';
import { CollectionClient } from './CollectionClient';
import { Suspense } from 'react';
import { getCollectionItems, getCollectionFilters, getCollectionTotalCount } from '@/actions/collection';

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const filter = params.filter as string | undefined;
  const search = params.q as string | undefined;
  
  // Construct filter object
  const filters: any = { search };
  
  if (filter) {
    if (filter === 'sealed') {
      filters.sealed = true;
    } else {
      filters.category = [filter];
    }
  }

  // ✅ Parallel fetch — all 3 queries run simultaneously
  const [{ items, hasMore }, filterOptions, totalCount] = await Promise.all([
    getCollectionItems(1, filters),
    getCollectionFilters(),
    getCollectionTotalCount()
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="py-24 px-6 max-w-7xl mx-auto flex-1 w-full">
        <div className="mb-12">
          <h1 className="font-cormorant text-5xl font-bold mb-4">The Collection</h1>
          <p className="text-muted-foreground text-lg">
            Browse our complete archive of nostalgic treasures. ({totalCount} items total)
          </p>
        </div>

        <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading collection...</div>}>
          <CollectionClient 
            initialItems={items} 
            initialHasMore={hasMore}
            filterOptions={filterOptions}
            initialFilter={filter}
            initialSearch={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
