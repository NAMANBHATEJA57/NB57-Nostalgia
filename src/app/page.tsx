import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
        <h1 className="font-cormorant text-6xl md:text-7xl font-bold tracking-tighter mb-6">
          NB57's Nostalgia
        </h1>
        <p className="text-xl md:text-2xl font-cormorant text-muted-foreground mb-4">
          India's Digital Archive of Vintage Collectibles
        </p>
        <p className="text-lg max-w-2xl text-slate-600 mb-10">
          Discover collectible Tazos, Trading Cards, Promotional Merchandise and nostalgic treasures from the 90s and 2000s.
        </p>
        <Link href="/collection">
          <Button size="lg" className="rounded-full px-8 text-lg font-medium transition-transform hover:scale-105 active:scale-95">
            Browse Collection
          </Button>
        </Link>
      </section>

      {/* Stats Strip */}
      <section className="border-y bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
          <div>
            <div className="font-cormorant text-4xl font-bold mb-2">520+</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Items</div>
          </div>
          <div>
            <div className="font-cormorant text-4xl font-bold mb-2">18</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</div>
          </div>
          <div>
            <div className="font-cormorant text-4xl font-bold mb-2">84%</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sealed</div>
          </div>
          <div>
            <div className="font-cormorant text-4xl font-bold mb-2">31</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sold</div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Placeholder) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="font-cormorant text-4xl font-bold mb-12 text-center">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Pokemon', img: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800' },
            { name: 'Yu-Gi-Oh', img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800' },
            { name: 'Ben 10', img: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=800' },
            { name: 'Others', img: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800' }
          ].map((category) => (
            <Link href={`/categories/${category.name.toLowerCase().replace(/ /g, '-')}`} key={category.name}>
              <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-muted-foreground/30">
                  <img src={category.img} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <h3 className="text-white font-medium text-xl">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NB57's Nostalgia. All rights reserved.</p>
      </footer>
    </div>
  );
}
