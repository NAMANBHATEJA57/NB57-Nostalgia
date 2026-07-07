import Navbar from '@/components/layout/Navbar';
import { prisma } from '@/lib/prisma';
import { CollectionClient } from './CollectionClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="py-24 px-6 max-w-7xl mx-auto flex-1 w-full">
        <div className="mb-12">
          <h1 className="font-cormorant text-5xl font-bold mb-4">The Collection</h1>
          <p className="text-muted-foreground text-lg">
            Browse our complete archive of nostalgic treasures. ({items.length} items)
          </p>
        </div>

        <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading collection...</div>}>
          <CollectionClient items={items} />
        </Suspense>
      </div>
    </div>
  );
}
