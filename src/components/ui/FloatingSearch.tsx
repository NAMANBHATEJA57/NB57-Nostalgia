"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function FloatingSearch({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search collections, categories, items..." 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            runCommand(() => router.push(`/collection?q=${encodeURIComponent(e.currentTarget.value.trim())}`));
          }
        }}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push('/collection'))}>
            All Collectibles
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/collection?filter=bakugan'))}>
            Bakugan Collection
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/collection?filter=beyblade'))}>
            Beyblade Collection
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/collection?filter=sealed'))}>
            Factory Sealed Items
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/collection?filter=pokemon'))}>
            Pokemon Collection
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
