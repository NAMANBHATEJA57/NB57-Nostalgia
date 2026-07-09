"use client";

import { Search, Bell, Plus, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";

export function TopBar() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex-1 flex items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory, collections, or prices... (Press '/')"
            className="w-full bg-background border-border pl-9 h-9 text-sm rounded-md shadow-sm focus-visible:ring-accent"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="h-9 gap-1.5 shadow-sm" render={<Link href="/admin/new-item" />}>
          <Plus className="h-4 w-4" />
          <span>Quick Add</span>
        </Button>

        <div className="h-5 w-px bg-border mx-2" />

        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        
        {mounted && (
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Moon className="h-4 w-4 hidden dark:block" />
            <Sun className="h-4 w-4 block dark:hidden" />
          </Button>
        )}

        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full border border-border bg-background ml-1">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
