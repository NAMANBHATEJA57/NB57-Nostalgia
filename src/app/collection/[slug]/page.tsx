import Navbar from '@/components/layout/Navbar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { ImageGallery } from '@/components/ui/ImageGallery';

export const dynamic = 'force-dynamic';

export default async function CollectionItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true, // Fetch extra images
      itemTags: { include: { tag: true } }
    }
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="py-24 px-6 max-w-6xl mx-auto flex-1 w-full">
        <Link href="/collection" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collection
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Gallery Section */}
            <div className="flex flex-col relative h-full">
               {item.sealed && (
                <Badge className="absolute top-6 left-6 bg-amber-500 text-white border-transparent hover:bg-amber-600 shadow-sm z-10 text-xs px-3 py-1">
                  Sealed
                </Badge>
              )}
              <Badge variant="secondary" className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm z-10 text-xs px-3 py-1">
                {item.condition}
              </Badge>
              
              <ImageGallery coverImage={item.coverImage} images={item.images} altText={item.name} />
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-12 flex flex-col border-l">
              <div className="mb-2">
                <Link href={`/categories/${item.category?.slug}`} className="text-sm font-semibold text-blue-600 uppercase tracking-wider hover:underline">
                  {item.category?.name || 'Uncategorized'}
                </Link>
              </div>
              <h1 className="font-cormorant text-4xl lg:text-5xl font-bold mb-4 text-slate-900 leading-tight">
                {item.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b">
                <span className="text-3xl font-bold text-slate-900">
                  {item.askingPrice ? `₹${item.askingPrice.toLocaleString('en-IN')}` : 'Price on Request'}
                </span>
                <Badge variant="outline" className={item.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'}>
                  {item.availability}
                </Badge>
              </div>

              <div className="prose prose-slate mb-8 max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.description || 'No description available for this item.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                {item.series && (
                  <div>
                    <span className="text-slate-500 block mb-1">Series</span>
                    <span className="font-medium text-slate-900">{item.series}</span>
                  </div>
                )}
                {item.character && (
                  <div>
                    <span className="text-slate-500 block mb-1">Character</span>
                    <span className="font-medium text-slate-900">{item.character}</span>
                  </div>
                )}
                {item.manufacturer && (
                  <div>
                    <span className="text-slate-500 block mb-1">Manufacturer</span>
                    <span className="font-medium text-slate-900">{item.manufacturer}</span>
                  </div>
                )}
                {item.releaseYear && (
                  <div>
                    <span className="text-slate-500 block mb-1">Release Year</span>
                    <span className="font-medium text-slate-900">{item.releaseYear}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8 flex gap-4">
                {item.availability === 'Available' ? (
                  <Button size="lg" className="w-full rounded-full text-base font-medium h-14">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Inquire to Buy
                  </Button>
                ) : (
                  <Button size="lg" variant="secondary" className="w-full rounded-full text-base font-medium h-14" disabled>
                    Currently Unavailable
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
