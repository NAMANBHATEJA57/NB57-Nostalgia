"use client";

import { useInterestedItems } from "@/components/context/InterestedItemsContext";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createLead } from "./actions";
import { toast } from "sonner";

export function InquiryWorkspace() {
  const { items, removeItem, clearItems } = useInterestedItems();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableItems = items.filter(i => i.availability !== 'Sold');
  const soldItems = items.filter(i => i.availability === 'Sold');
  const estimatedTotal = availableItems.reduce((sum, item) => sum + item.askingPrice, 0);

  const onSubmit = async () => {
    if (availableItems.length === 0) {
      toast.error("You don't have any available items to inquire about.");
      return;
    }

    setIsSubmitting(true);

    const result = await createLead({
      buyerName: "Unknown Collector",
      phone: "Not Provided",
      city: "Unknown",
      country: "Unknown",
      estimatedTotal,
      items: availableItems.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        condition: item.condition,
        estimatedPrice: item.askingPrice
      }))
    });

    if (result.success) {
      setInquirySent(true);
      
      // Generate WhatsApp Message
      const waNumber = "919811535385";
      
      let message = `━━━━━━━━━━━━━━━━━━\nHello NB57's Nostalgia 👋\nI am interested in the following collectibles.\n━━━━━━━━━━━━━━━━━━\n\n`;
      
      availableItems.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `Collection ID: ${item.sku}\n`;
        if (item.condition) message += `Condition: ${item.condition}\n`;
        message += `Estimated Price: ₹${item.askingPrice.toLocaleString()}\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
      });

      message += `*Estimated Total: ₹${estimatedTotal.toLocaleString()}*\n\n`;
      
      message += `Could you please confirm availability and final pricing?\nThank you!\n━━━━━━━━━━━━━━━━━━`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
      
    } else {
      toast.error(result.error);
    }
    
    setIsSubmitting(false);
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 text-center py-32">
        <h2 className="font-cormorant text-4xl font-bold text-slate-900 mb-4">Your collection is empty</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Explore the archive and collect items you are interested in. When you are ready, you can request pricing and availability.
        </p>
        <Button render={<Link href="/collection" />} size="lg" className="rounded-full bg-slate-900 hover:bg-blue-600 h-14 px-8 text-base">
          Explore Archive
        </Button>
      </div>
    );
  }

  if (inquirySent) {
    return (
      <div className="max-w-7xl mx-auto px-6 text-center py-32">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-cormorant text-4xl font-bold text-slate-900 mb-4">Inquiry Sent Successfully</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          We have generated your WhatsApp inquiry. A member of our team will review your selection and confirm availability.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => clearItems()} className="rounded-full h-12">
            Clear Interested Items
          </Button>
          <Button render={<Link href="/collection" />} size="lg" className="rounded-full bg-slate-900 h-12">
            Continue Browsing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <h1 className="font-cormorant text-5xl font-bold text-slate-900 mb-4">Interested Items</h1>
        <p className="text-slate-500 font-light text-lg">Collect the items you're interested in before contacting us.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-7 space-y-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row gap-6 border border-slate-100 shadow-sm relative group">
              <div className="w-full sm:w-32 aspect-square relative rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <Image 
                  src={item.image || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
                  alt={item.name} 
                  fill 
                  className={`object-cover ${item.availability === 'Sold' ? 'opacity-50 grayscale' : ''}`}
                />
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg text-slate-900">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs font-mono text-slate-400 mb-4">{item.sku}</div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1">Condition</span>
                    <span className="text-sm font-medium text-slate-700">{item.condition || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1">Estimate</span>
                    <span className={`font-mono font-bold ${item.availability === 'Sold' ? 'text-slate-400 line-through' : 'text-blue-600'}`}>
                      ₹{item.askingPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {item.availability === 'Sold' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10">
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center text-slate-600 font-medium text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                    This item is no longer available.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Summary & Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-32">
            <h3 className="font-cormorant text-2xl font-bold mb-6 text-slate-900">Inquiry Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Items Selected</span>
                <span className="font-medium text-slate-900">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Available</span>
                <span className="font-medium text-slate-900">{availableItems.length}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Reserved/Sold</span>
                <span className="font-medium text-slate-900">{soldItems.length}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-900 font-medium">Estimated Total</span>
                <span className="font-mono text-2xl font-bold text-blue-600">₹{estimatedTotal.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Final pricing may vary depending on item condition, bundle discounts, and availability. Shipping will be calculated later.
              </p>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <Button onClick={onSubmit} size="lg" disabled={isSubmitting || availableItems.length === 0} className="w-full rounded-full h-14 bg-emerald-600 hover:bg-emerald-700 text-base font-medium mt-4 shadow-lg shadow-emerald-900/20">
                {isSubmitting ? 'Generating...' : 'Send to WhatsApp'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
