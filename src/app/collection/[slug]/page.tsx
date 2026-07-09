import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BoxSelect, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense } from 'react';
import { getItemBySlug, getRelatedItems } from '@/lib/data';

const ImageGallery = dynamic(() => import('@/components/ui/ImageGallery').then(mod => mod.ImageGallery), {
  ssr: true,
});

export const revalidate = 86400;

// Shared item fetch for metadata + page (React.cache dedup)
async function getItem(slug: string) {
  const item = await getItemBySlug(slug);
  if (!item) notFound();
  return item;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  return {
    title: `${item.name} — NB57's Nostalgia`,
    description: item.description?.slice(0, 160) || `View ${item.name} in NB57's Nostalgia collection.`,
  };
}

// Related items as a separate async component for streaming
async function RelatedItems({ categoryId, excludeId, categoryName }: { categoryId: string; excludeId: string; categoryName: string }) {
  const relatedItems = await getRelatedItems(categoryId, excludeId);
  
  if (relatedItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 mt-32 pt-16 border-t border-slate-200">
      <h2 className="font-cormorant text-3xl font-bold mb-8">Related Collectibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedItems.map(related => (
          <Link href={`/collection/${related.slug}`} key={related.id} className="group cursor-pointer">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm group-hover:shadow-md transition-all duration-500 ease-out group-hover:-translate-y-1">
              <Image 
                src={related.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                alt={related.name} 
                fill 
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{categoryName}</div>
              <h3 className="font-medium text-base leading-snug line-clamp-1 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{related.name}</h3>
              <div className="text-sm text-slate-500 font-mono">{related.askingPrice ? `₹${related.askingPrice.toLocaleString()}` : 'Value on Request'}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function CollectionItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900 selection:bg-slate-200">
      <Navbar />
      
      <main className="flex-1 w-full pt-36 pb-32">
        {/* Navigation Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <Link href="/collection" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Archive
          </Link>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
              {item.sealed && (
                <Badge className="absolute top-6 left-6 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 px-3 py-1 text-sm font-medium backdrop-blur-sm z-10">
                  Factory Sealed
                </Badge>
              )}
              <div className="absolute top-6 right-6 z-10">
                {item.availability === 'Sold' ? (
                  <Badge variant="secondary" className="bg-slate-800/90 text-white border-transparent px-3 py-1 font-medium backdrop-blur-sm shadow-sm">Sold</Badge>
                ) : item.availability === 'Reserved' ? (
                  <Badge variant="secondary" className="bg-yellow-500/90 text-white border-transparent px-3 py-1 font-medium backdrop-blur-sm shadow-sm">Reserved</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-500/90 text-white border-transparent px-3 py-1 font-medium backdrop-blur-sm shadow-sm">Available</Badge>
                )}
              </div>
              <ImageGallery coverImage={item.coverImage} images={item.images} altText={item.name} />
            </div>
            
            {/* Extended Details */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-cormorant text-2xl font-bold mb-6">Archive Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Accession Number</span>
                  <span className="font-medium text-slate-900 font-mono">{item.sku || `NB57-${item.id.slice(-6).toUpperCase()}`}</span>
                </div>
                {item.manufacturer && (
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Manufacturer</span>
                    <span className="font-medium text-slate-900">{item.manufacturer}</span>
                  </div>
                )}
                {item.releaseYear && (
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Release Year</span>
                    <span className="font-medium text-slate-900">{item.releaseYear}</span>
                  </div>
                )}
                {item.series && (
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Series / Set</span>
                    <span className="font-medium text-slate-900">{item.series}</span>
                  </div>
                )}
                {item.character && (
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Character</span>
                    <span className="font-medium text-slate-900">{item.character}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Dimensions</span>
                  <span className="font-medium text-slate-900 text-slate-500 italic">Not recorded</span>
                </div>
              </div>
              
              {item.itemTags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <span className="text-slate-400 block mb-3 text-xs uppercase tracking-widest font-semibold">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {item.itemTags.map(it => (
                      <Badge key={it.tagId} variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-normal">
                        {it.tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Details & Value */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="mb-3">
                <Link href={`/collection?filter=${item.category?.name?.toLowerCase()}`} className="text-xs font-semibold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">
                  {item.category?.name || 'Uncategorized'}
                </Link>
              </div>
              <h1 className="font-cormorant text-4xl lg:text-5xl font-bold mb-6 text-slate-900 leading-[1.1]">
                {item.name}
              </h1>
              
              <div className="prose prose-slate prose-p:font-light prose-p:leading-relaxed text-slate-600 max-w-none">
                {item.description ? (
                  item.description.includes('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: item.description }} className="[&>p]:mb-4" />
                  ) : (
                    <p className="whitespace-pre-wrap">{item.description}</p>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">No detailed history available for this item.</p>
                )}
              </div>
            </div>

            {/* Condition Box */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Condition Assessment</h4>
                  <p className="text-lg font-medium text-slate-700">{item.condition}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                  {item.condition.toLowerCase().includes('mint') || item.sealed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : item.condition.toLowerCase().includes('played') || item.condition.toLowerCase().includes('damage') ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Fair Value Widget */}
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/40 border border-slate-100">
              <h3 className="font-cormorant text-2xl font-bold mb-6">Market Valuation</h3>
              
              <div className="mb-6">
                <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Price</span>
                <div className="text-4xl font-bold text-blue-600 tracking-tight font-mono">
                  {item.askingPrice ? `₹${item.askingPrice.toLocaleString()}` : 'Value on Request'}
                </div>
              </div>

              {(item.fairValueMin && item.fairValueMax) && (
                <div className="mb-8">
                  <span className="text-slate-400 block mb-1 text-xs uppercase tracking-widest font-semibold">Estimated Fair Value</span>
                  <div className="text-2xl font-semibold text-slate-600 tracking-tight font-mono">
                    ₹{item.fairValueMin.toLocaleString()} – ₹{item.fairValueMax.toLocaleString()}
                  </div>
                </div>
              )}
              
              {(!item.fairValueMin || !item.fairValueMax) && (
                <div className="mb-8"></div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Based on</span>
                  <span className="font-medium text-slate-900">{item.priceSource || 'Community Sales & Historical Listings'}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Market Confidence</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      item.priceConfidence === 'High' ? 'text-emerald-600' : 
                      item.priceConfidence === 'Low' ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {item.priceConfidence || 'Medium'}
                    </span>
                  </div>
                </div>
                {item.highestSeenPrice && (
                  <div className="flex justify-between items-center text-sm pb-1">
                    <span className="text-slate-500">Highest Recorded Sale</span>
                    <span className="font-medium text-slate-900 font-mono">₹{item.highestSeenPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {item.availability === 'Available' ? (
                <Button size="lg" className="w-full rounded-full text-base font-medium h-14 bg-slate-900 hover:bg-blue-600 transition-colors duration-500 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95">
                  Inquire to Acquire
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="w-full rounded-full text-base font-medium h-14 border-slate-300 text-slate-500 cursor-not-allowed">
                  Currently {item.availability}
                </Button>
              )}
            </div>
            
          </div>
        </div>

        {/* Related Collectibles — streamed via Suspense */}
        <Suspense fallback={<div className="max-w-7xl mx-auto px-6 mt-32 pt-16" />}>
          <RelatedItems categoryId={item.categoryId} excludeId={item.id} categoryName={item.category?.name || 'Uncategorized'} />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}
