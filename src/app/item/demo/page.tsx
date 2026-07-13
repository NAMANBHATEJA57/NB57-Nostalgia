import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";

export default function DemoItemPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />
      <main className="flex-1 py-12 px-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          Home / Collection / Trading Cards / <span className="text-foreground font-medium">Base Set Charizard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Images Section */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden border shadow-sm relative group cursor-crosshair">
              <img 
                src="https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1200" 
                alt="Base Set Charizard" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`aspect-square bg-white rounded-xl overflow-hidden border cursor-pointer hover:border-primary transition-colors ${i === 1 ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                  <img src="https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-2">
            <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Pokemon</span>
              <span>•</span>
              <span>Trading Card</span>
            </div>
            
            <h1 className="font-cormorant text-5xl md:text-6xl font-bold leading-tight mb-6">
              Base Set Charizard Holographic (1999)
            </h1>
            
            <div className="text-4xl font-medium mb-8 font-cormorant tracking-tight">₹4,500</div>
            
            <div className="prose prose-slate prose-lg mb-10 text-slate-600">
              <p>
                A beautiful vintage Base Set Charizard holographic card from 1999. Highly sought after by collectors worldwide. This piece is in exceptional condition considering its age. Features the iconic original artwork by Mitsuhiro Arita.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-center">
                <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Condition</div>
                <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Near Mint (NM)
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-center">
                <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Year / Era</div>
                <div className="text-lg font-semibold text-foreground">1999</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col gap-3 mb-10 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>100% Authentic Vintage Collectible</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Truck className="w-5 h-5 text-orange-600" />
                <span>Ships securely packaged in top-loader</span>
              </div>
            </div>

            {/* CTA */}
            <Button size="lg" className="rounded-full w-full py-7 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-slate-900 text-white hover:bg-slate-800">
              Add to Interested Items
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
