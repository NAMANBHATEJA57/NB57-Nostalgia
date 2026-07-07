import Link from "next/link";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <Link href="/">
        <h1 className="font-cormorant text-2xl font-bold tracking-tight">NB57's Nostalgia</h1>
      </Link>
      <div className="space-x-6 text-sm font-medium">
        <Link href="/collection" className="hover:text-primary transition-colors">Collection</Link>
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
      </div>
    </nav>
  );
}
