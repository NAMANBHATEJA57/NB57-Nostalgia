"use client";

import { Button } from "@/components/ui/button";
import { Heart, Share, Link as LinkIcon, Check } from "lucide-react";
import { useInterestedItems } from "@/components/context/InterestedItemsContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ProductActions({ item }: { item: any }) {
  const { items, addItem, removeItem, isInterested } = useInterestedItems();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleInterested = () => {
    if (isInterested(item.id)) {
      removeItem(item.id);
      toast("Removed from Interested Items");
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
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${item.name} — NB57's Nostalgia`,
        url: window.location.href
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  if (!mounted) return <div className="h-[120px]" />; // Placeholder to avoid layout shift

  return (
    <div className="space-y-4 mt-8">
      {item.availability === 'Available' ? (
        <Button 
          size="lg" 
          onClick={handleToggleInterested}
          className={`w-full rounded-full text-base font-medium h-14 transition-all duration-300 ${
            isInterested(item.id) 
              ? 'bg-white text-red-500 border-2 border-red-500 hover:bg-red-50'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/20'
          }`}
        >
          <Heart className={`w-5 h-5 mr-2 transition-colors ${isInterested(item.id) ? 'fill-red-500' : ''}`} />
          {isInterested(item.id) ? 'Interested' : 'Add to Interested'}
        </Button>
      ) : (
        <Button size="lg" variant="outline" className="w-full rounded-full text-base font-medium h-14 border-slate-300 text-slate-500 cursor-not-allowed">
          Currently {item.availability}
        </Button>
      )}

      {item.availability === 'Available' && (
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleShare}
            className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 h-12"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleCopyLink}
            className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 h-12"
          >
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <LinkIcon className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      )}
    </div>
  );
}
