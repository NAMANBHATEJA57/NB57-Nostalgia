'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  coverImage: string;
  images: { url: string; id: string }[];
  altText: string;
}

export function ImageGallery({ coverImage, images, altText }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(coverImage);
  
  // Combine cover image with extra images
  const allImages = [coverImage, ...images.map(img => img.url)];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-slate-100 p-8 flex items-center justify-center relative min-h-[400px] flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={mainImage || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800'} 
          alt={altText}
          className="max-w-full max-h-[500px] object-contain drop-shadow-xl transition-all duration-300"
        />
      </div>
      
      {allImages.length > 1 && (
        <div className="flex gap-4 p-4 overflow-x-auto bg-slate-50 border-t">
          {allImages.map((imgUrl, index) => (
            <button 
              key={index}
              type="button"
              onClick={() => setMainImage(imgUrl)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                mainImage === imgUrl ? 'border-blue-600 shadow-md scale-105' : 'border-transparent hover:border-slate-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imgUrl} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
