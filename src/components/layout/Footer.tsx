import Link from "next/link";
import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-16 text-sm text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <h2 className="font-cormorant text-2xl font-bold tracking-tight text-slate-900 mb-4">NB57's Nostalgia</h2>
          <p className="text-muted-foreground">
            A curated digital archive of vintage collectibles and childhood memories from the 90s & 2000s.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Archive</h3>
          <ul className="space-y-3">
            <li><Link href="/collection" className="hover:text-black transition-colors">Collections</Link></li>
            <li><Link href="/collection?filter=sealed" className="hover:text-black transition-colors">Factory Sealed</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
          <ul className="space-y-3">
            <li><Link href="#timeline" className="hover:text-black transition-colors">Timeline</Link></li>
            <li><Link href="/blog" className="hover:text-black transition-colors">Blog</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Contact</h3>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-black transition-colors">WhatsApp</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Email</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NB57's Nostalgia. All rights reserved.</p>
        <div className="mt-4 md:mt-0 space-x-6">
          <Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-black transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
