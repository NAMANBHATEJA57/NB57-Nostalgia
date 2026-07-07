'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  coverImage: string;
  images: { url: string; id: string }[];
  altText: string;
}

export function ImageGallery({ coverImage, images, altText }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const allImages = [coverImage, ...images.map(img => img.url)];
  const mainImage = allImages[currentIndex];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Image View */}
      <div 
        className="bg-slate-100/50 flex items-center justify-center relative min-h-[500px] flex-1 group cursor-zoom-in overflow-hidden"
        onClick={() => setLightboxOpen(true)}
      >
        <Image 
          src={mainImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
          alt={altText}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />
        
        {/* Fullscreen Hint */}
        <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </div>
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 p-6 overflow-x-auto bg-white border-t border-slate-100 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {allImages.map((imgUrl, index) => (
            <button 
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-300 active:scale-95 ${
                currentIndex === index 
                  ? 'ring-2 ring-slate-900 ring-offset-2 scale-[1.02] opacity-100' 
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image 
                src={imgUrl} 
                alt={`${altText} Thumbnail ${index + 1}`} 
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Overlay — CSS transitions instead of framer-motion */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div 
            className="relative w-full max-w-6xl h-[80vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              src={mainImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
              alt={altText}
              fill
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-contain"
              quality={90}
            />
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-widest">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
