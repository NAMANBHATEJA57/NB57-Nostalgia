import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { getHomepageItems, getCategoriesWithCounts, getStatistics, getHeroBackgroundItems } from "@/lib/data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 3600;

export default async function Home() {
  // ✅ Parallel fetch — all 3 queries run simultaneously
  const [items, categories, { totalItems, sealedItems, soldItems }, heroItems] = await Promise.all([
    getHomepageItems(),
    getCategoriesWithCounts(),
    getStatistics(),
    getHeroBackgroundItems()
  ]);

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.name === 'Others') return 1;
    if (b.name === 'Others') return -1;
    return 0;
  });

  const featuredItems = items.filter(i => i.featured || i.sealed).slice(0, 3);

  const getCategoryFallbackImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pokemon')) return 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800';
    if (lower.includes('yu-gi-oh')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjwAcOcJ7LT2lQqGYZjnTXzjZK4rwlcvQW3IO8JpZWPhm8Z3_LPVQ2CO5b&s=10';
    if (lower.includes('ben 10')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyR6SW8d1bUW7wbpuQ8ozxb_G-91JlqfAfG7jXWs0K3Qty9Yf78gyyKCMz&s=10';
    if (lower.includes('bakugan')) return 'https://images.unsplash.com/photo-1618218168350-6e7c81151b64?q=80&w=800';
    if (lower.includes('beyblade')) return 'https://m.media-amazon.com/images/M/MV5BZDY4YzZkYzEtNTAzNS00NTE0LWIxMDktNmM4MTFmNDQ0NmIzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg';
    return 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900 selection:bg-slate-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24">
        {/* Background Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <div className="grid grid-cols-4 gap-8 rotate-12 scale-150 h-[150vh]">
            {[...Array(4)].map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="flex flex-col gap-8"
                style={{ 
                  animation: `marquee-vertical ${30 + (colIndex % 3) * 10}s linear infinite`,
                  animationDirection: colIndex % 2 === 0 ? 'normal' : 'reverse'
                }}
              >
                {[...Array(12)].map((_, rowIndex) => {
                  const item = heroItems[(colIndex * 12 + rowIndex) % Math.max(heroItems.length, 1)];
                  return (
                    <div key={rowIndex} className="w-64 h-64 shrink-0 bg-slate-100 rounded-2xl overflow-hidden relative opacity-[15%] shadow-sm">
                      {item?.coverImage && (
                        <Image 
                          src={item.coverImage}
                          alt=""
                          fill
                          sizes="256px"
                          className="object-cover" 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-cormorant text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            NB57's Nostalgia
          </h1>
          <p className="text-xl md:text-2xl font-sans text-slate-600 mb-6 max-w-2xl font-light leading-relaxed">
            India's Digital Archive of Vintage Collectibles
          </p>
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl font-light">
            A curated collection of Tazos, Trading Cards, Promotional Merchandise, Collectibles and Childhood Memories from the 90s & 2000s.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/collection">
              <Button size="lg" className="rounded-full px-10 h-14 text-base font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all hover:-translate-y-1 hover:shadow-lg">
                Browse Collection
              </Button>
            </Link>
            <Link href="/collection?filter=categories">
              <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base font-medium border-slate-300 hover:bg-slate-100 transition-all">
                View Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Featured Categories */}
      <section className="py-32 px-6 max-w-[1400px] mx-auto" id="categories">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="font-cormorant text-4xl md:text-5xl font-bold tracking-tight mb-4">Curated Categories</h2>
            <p className="text-slate-500 font-light text-lg">Explore the archives by theme and franchise.</p>
          </div>
        </div>
        
        <div className="flex justify-center flex-wrap gap-4 md:gap-6">
          {sortedCategories.slice(0, 8).map((category, index) => (
            <Link href={`/collection?filter=${category.name.toLowerCase()}`} key={category.id} className="w-[320px] shrink group block cursor-pointer">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-500 ease-out group-hover:-translate-y-2">
                <div className="absolute inset-0">
                  <Image 
                    src={category.thumbnailImage || getCategoryFallbackImage(category.name)} 
                    alt={category.name} 
                    fill 
                    sizes="320px"
                    priority={index < 2}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 transition-colors duration-500 ease-out group-hover:from-slate-900/95">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-white font-cormorant font-bold text-3xl mb-2">{category.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 max-w-[80%] font-light">{category.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added (Horizontal Scroll) */}
      <Suspense fallback={<div className="py-32 bg-white border-t border-slate-100" />}>
        <section className="py-32 bg-white overflow-hidden border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <h2 className="font-cormorant text-4xl md:text-5xl font-bold tracking-tight mb-4">New Additions</h2>
            <p className="text-slate-500 font-light text-lg">The latest items accessioned into the archive.</p>
          </div>
          
          <div className="flex overflow-x-auto pb-12 px-6 gap-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {items.map((item) => (
              <Link href={`/collection/${item.slug}`} key={item.id} className="snap-center shrink-0 w-[280px] sm:w-[320px] group flex flex-col cursor-pointer rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="aspect-square relative bg-slate-100 w-full overflow-hidden">
                  <Image 
                    src={item.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                    alt={item.name} 
                    fill 
                    sizes="320px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
                  {item.sealed && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-0.5 text-xs font-medium backdrop-blur-sm bg-amber-100/90 shadow-sm">Factory Sealed</Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{item.category?.name || 'Uncategorized'}</div>
                    {item.availability === 'Sold' ? (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100">Sold</Badge>
                    ) : item.availability === 'Reserved' ? (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Reserved</Badge>
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
            ))}
          </div>
        </section>
      </Suspense>

      {/* All Selection (Horizontal Scroll) */}
      <Suspense fallback={<div className="py-32 bg-[#FAFAF8] border-t border-slate-100" />}>
        <section className="py-32 bg-[#FAFAF8] overflow-hidden border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-cormorant text-4xl md:text-5xl font-bold tracking-tight mb-4">All Selection</h2>
              <p className="text-slate-500 font-light text-lg">Browse through our entire curated archive.</p>
            </div>
            <Link href="/collection">
              <Button variant="outline" className="rounded-full px-8 h-12 text-base border-slate-300 hover:bg-slate-100 transition-all">
                View All Collection
              </Button>
            </Link>
          </div>
          
          <div className="flex overflow-x-auto pb-12 px-6 gap-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {items.slice().reverse().map((item) => (
              <Link href={`/collection/${item.slug}`} key={item.id} className="snap-center shrink-0 w-[280px] sm:w-[320px] group flex flex-col cursor-pointer rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="aspect-square relative bg-slate-100 w-full overflow-hidden">
                  <Image 
                    src={item.coverImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                    alt={item.name} 
                    fill 
                    sizes="320px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
                  {item.sealed && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-0.5 text-xs font-medium backdrop-blur-sm bg-amber-100/90 shadow-sm">Factory Sealed</Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{item.category?.name || 'Uncategorized'}</div>
                    {item.availability === 'Sold' ? (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100">Sold</Badge>
                    ) : item.availability === 'Reserved' ? (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Reserved</Badge>
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
            ))}
          </div>
        </section>
      </Suspense>

      <Footer />
    </div>
  );
}
