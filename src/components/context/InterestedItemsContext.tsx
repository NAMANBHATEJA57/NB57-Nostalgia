"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";

export interface InterestedItem {
  id: string;
  slug: string;
  name: string;
  image?: string;
  sku: string;
  condition?: string;
  availability: string;
  askingPrice: number;
}

interface InterestedItemsContextType {
  items: InterestedItem[];
  addItem: (item: InterestedItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  isInterested: (id: string) => boolean;
}

const InterestedItemsContext = createContext<InterestedItemsContextType | undefined>(undefined);

export function InterestedItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InterestedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nb57_interested_items');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load interested items from local storage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('nb57_interested_items', JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save interested items to local storage:", error);
      }
    }
  }, [items, isInitialized]);

  const addItem = (item: InterestedItem) => {
    setItems((prev) => {
      if (prev.some(i => i.id === item.id)) return prev;
      toast.success("Added to Interested Items");
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter(i => i.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  const isInterested = (id: string) => {
    return items.some(i => i.id === id);
  };

  return (
    <InterestedItemsContext.Provider value={{ items, addItem, removeItem, clearItems, isInterested }}>
      {children}
    </InterestedItemsContext.Provider>
  );
}

export function useInterestedItems() {
  const context = useContext(InterestedItemsContext);
  if (context === undefined) {
    throw new Error('useInterestedItems must be used within an InterestedItemsProvider');
  }
  return context;
}
