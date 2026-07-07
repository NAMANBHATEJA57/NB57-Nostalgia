import Navbar from '@/components/layout/Navbar';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) {
    notFound();
  }

  const items = await prisma.item.findMany({
    where: { categoryId: category.id },
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
          <Link href="/collection" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back to full collection</Link>
          <h1 className="font-cormorant text-5xl font-bold mb-4">{category.name}</h1>
          <p className="text-muted-foreground text-lg">
            {category.description || `Browse our collection of ${category.name} items.`} ({items.length} items)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link href={`/collection/${item.slug}`} key={item.id}>
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
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
          
          {items.length === 0 && (
            <div className="col-span-full text-center py-24 text-muted-foreground">
              No items found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
