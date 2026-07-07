"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import dynamic from 'next/dynamic';

const FloatingSearch = dynamic(() => import('../ui/FloatingSearch').then(mod => mod.FloatingSearch), {
  ssr: false,
});

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 h-[80px] ${scrolled ? 'bg-white/70 backdrop-blur-md border-b shadow-sm' : 'bg-white/0'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="NB57's Nostalgia Logo" 
              width={140} 
              height={40} 
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center space-x-8 text-sm font-medium text-slate-700">
            <Link href="/collection" className="hover:text-black transition-colors">Collections</Link>
            <button onClick={() => setSearchOpen(true)} className="hover:text-black transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
      <FloatingSearch open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
